import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	TextInput,
	Pressable,
	ScrollView,
	ActivityIndicator,
	FlatList,
	Keyboard,
	TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { PDFDocument } from 'pdf-lib';
import { LinearGradient } from 'expo-linear-gradient';
import {
	DocumentsStackParamList,
	VendorsStackParamList,
} from '../../types/navigation.types';
import { uploadProject, searchAdmins } from '../../api/projects';
import { useUserStore } from '../../shared/user-store/useUserStore';
import { onError, onSuccess } from '../../utils/toast';
import { useDebouncedCallback } from 'use-debounce';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../providers/ThemeProvider';
import { TextComponent } from 'src/components';
import {
	UploadIcon,
	SearchIcon,
	FilePdfIcon,
	FileWordIcon,
	FileImageIcon,
	DocumentTextIcon,
	CloseIcon,
	LightbulbIcon,
	PlusIcon,
	TrashIcon,
} from 'src/assets/icons';
import { useForm, Controller } from 'react-hook-form';

type Props = NativeStackScreenProps<
	DocumentsStackParamList | VendorsStackParamList,
	'SubmitDocument'
>;

type SelectedFile = {
	uri: string;
	name: string;
	size?: number;
	mimeType?: string;
	pageCount?: number;
};

type FormValues = {
	title: string;
	description: string;
	vendor: AdminInfo | null;
	files: SelectedFile[];
};

export default function SubmitDocumentScreen({ navigation, route }: Props) {
	const {
		vendorId,
		vendorName,
		vendorEmail,
		vendorProfilePicture,
		vendorPrintingCost,
		vendorRating,
		isVendorLocked,
	} = route.params || {};
	const { colors } = useTheme();
	const { user } = useUserStore();
	const queryClient = useQueryClient();

	// React Hook Form
	const {
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		defaultValues: {
			title: '',
			description: '',
			vendor:
				vendorId && vendorName
					? {
							_id: vendorId,
							name: vendorName,
							email: vendorEmail || '',
							profilePicture: vendorProfilePicture ?? undefined,
							printingCost: vendorPrintingCost ?? undefined,
							rating: vendorRating,
						}
					: null,
			files: [],
		},
	});

	const files = watch('files');
	const selectedVendor = watch('vendor');

	const [loading, setLoading] = useState(false);

	// Vendor search state (inline dropdown like web version)
	const [vendorSearchQuery, setVendorSearchQuery] = useState('');
	const [vendorSearchResults, setVendorSearchResults] = useState<AdminInfo[]>(
		[],
	);
	const [searchingVendors, setSearchingVendors] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const searchInputRef = useRef<TextInput>(null);

	// Debounced vendor search
	const debouncedSearch = useDebouncedCallback(async (query: string) => {
		if (query.trim().length < 2) {
			setVendorSearchResults([]);
			setShowDropdown(false);
			return;
		}
		setSearchingVendors(true);
		try {
			const response = await searchAdmins(query);

			if (
				response.data &&
				'data' in response.data &&
				Array.isArray(response.data.data?.admins)
			) {
				// Handle standard API response structure
				setVendorSearchResults(response.data.data.admins);
				setShowDropdown(true);
			} else if (Array.isArray(response)) {
				// Handle if response is directly an array
				setVendorSearchResults(response);
				setShowDropdown(true);
			} else {
				// Fallback or empty
				setVendorSearchResults([]);
			}
		} catch (error) {
			console.error('Vendor search error:', error);
			setVendorSearchResults([]);
		} finally {
			setSearchingVendors(false);
		}
	}, 500);

	useEffect(() => {
		debouncedSearch(vendorSearchQuery);
	}, [vendorSearchQuery]);

	// Function to get PDF page count using pdf-lib
	const getPdfPageCount = async (
		fileUri: string,
	): Promise<number | undefined> => {
		try {
			// Read the file as base64
			const base64 = await FileSystem.readAsStringAsync(fileUri, {
				encoding: FileSystem.EncodingType.Base64,
			});

			// Convert base64 to Uint8Array
			const binaryString = atob(base64);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			// Load the PDF document
			const pdfDoc = await PDFDocument.load(bytes, {
				ignoreEncryption: true,
			});

			return pdfDoc.getPageCount();
		} catch (error) {
			console.error('Error getting PDF page count:', error);
			return undefined;
		}
	};

	const handleSelectFile = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: [
					'application/pdf',
					'application/msword',
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
					'image/*',
				],
				copyToCacheDirectory: true,
				multiple: true,
			});

			if (!result.canceled && result.assets) {
				const newFiles: SelectedFile[] = [];

				for (const file of result.assets) {
					// Check for duplicates
					if (files.some((f) => f.uri === file.uri)) continue;

					const newFile: SelectedFile = {
						uri: file.uri,
						name: file.name,
						size: file.size,
						mimeType: file.mimeType,
					};

					// Get page count if it's a PDF
					if (file.mimeType?.includes('pdf')) {
						const pages = await getPdfPageCount(file.uri);
						newFile.pageCount = pages;
					} else {
						// For non-PDF files (images), set page count to 1
						newFile.pageCount = 1;
					}
					newFiles.push(newFile);
				}

				// If no files were previously selected and we just added some, auto-fill title
				const currentTitle = watch('title');
				if (!currentTitle && newFiles.length > 0) {
					const firstFile = newFiles[0];
					const fileName =
						firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) ||
						firstFile.name;
					setValue('title', fileName);
				}

				setValue('files', [...files, ...newFiles]);
			}
		} catch (error) {
			console.error('File picker error:', error);
			onError('Error', 'Failed to select file');
		}
	};

	const removeFile = (index: number) => {
		const newFiles = [...files];
		newFiles.splice(index, 1);
		setValue('files', newFiles);
	};

	const onSubmit = async (data: FormValues) => {
		if (!user) {
			onError('Error', 'You must be logged in to submit documents');
			return;
		}

		if (!data.vendor) {
			onError('Validation Error', 'Please select a vendor');
			return;
		}

		if (data.files.length === 0) {
			onError('Validation Error', 'Please select at least one file');
			return;
		}

		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('title', data.title.trim());
			formData.append('assignedAdmin', data.vendor._id);

			if (data.description.trim()) {
				formData.append('description', data.description.trim());
			}

			// Aggregate page count
			const totalPageCount = data.files.reduce((acc, file) => {
				return acc + (file.pageCount || 0);
			}, 0);

			if (totalPageCount > 0) {
				formData.append('pageCount', totalPageCount.toString());
			}

			// Append files
			data.files.forEach((file) => {
				// Using 'files' as key to match backend array config (likely upload.array('files'))
				formData.append('files', {
					uri: file.uri,
					name: file.name,
					type: file.mimeType || 'application/octet-stream',
				} as any);
			});

			console.log('Submitting document:', {
				title: data.title.trim(),
				assignedAdmin: data.vendor._id,
				fileCount: data.files.length,
			});

			await uploadProject(formData);
			// Invalidate the student projects query so the list refreshes when navigating back
			queryClient.invalidateQueries({ queryKey: ['studentProjects'] });
			// Navigate back after successful upload
			navigation.goBack();
		} catch (error: any) {
			console.error('Submit error:', error);
			const message =
				error?.response?.data?.message ||
				error?.message ||
				'Failed to submit document';
			onError('Error', message);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectVendor = (vendor: AdminInfo) => {
		setValue('vendor', vendor);
		setVendorSearchQuery('');
		setShowDropdown(false);
		Keyboard.dismiss();
	};

	const handleClearVendor = () => {
		setValue('vendor', null);
		setVendorSearchQuery('');
	};

	const formatFileSize = (bytes?: number) => {
		if (!bytes) return 'Size unknown';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
	};

	const renderFileIcon = (mimeType?: string, size: number = 28) => {
		if (mimeType?.includes('pdf'))
			return (
				<FilePdfIcon
					size={size}
					color={colors.primary}
				/>
			);
		if (mimeType?.includes('word') || mimeType?.includes('document'))
			return (
				<FileWordIcon
					size={size}
					color={colors.primary}
				/>
			);
		if (mimeType?.includes('image'))
			return (
				<FileImageIcon
					size={size}
					color={colors.primary}
				/>
			);
		return (
			<DocumentTextIcon
				size={size}
				color={colors.primary}
			/>
		);
	};

	const getFileTypeLabel = (mimeType?: string) => {
		if (mimeType?.includes('pdf')) return 'PDF Document';
		if (mimeType?.includes('word') || mimeType?.includes('document'))
			return 'Word Document';
		if (mimeType?.includes('image')) return 'Image File';
		return 'Document';
	};

	return (
		<ScrollView
			className="flex-1 bg-background"
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}>
			{/* Gradient Header */}
			<LinearGradient
				colors={[colors.primary, colors.accent]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				className="pt-14 pb-10 px-6 rounded-b-3xl">
				<View className="items-center">
					<View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4">
						<UploadIcon
							size={32}
							color="#fff"
						/>
					</View>
					<TextComponent className="text-white font-bold text-2xl mb-1">
						Submit Document
					</TextComponent>
					<TextComponent className="text-white/80 text-base text-center">
						Upload multiple files and send to a vendor
					</TextComponent>
				</View>
			</LinearGradient>

			<View className="px-5 pt-6 pb-8 -mt-4">
				{/* Main Form Card */}
				<View className="card-3d rounded-2xl p-5 mb-5 bg-card shadow-sm">
					{/* Vendor Selection */}
					<View className="mb-5">
						<TextComponent className="text-foreground font-semibold text-base mb-2.5">
							Select Vendor{' '}
							<TextComponent className="text-destructive">*</TextComponent>
						</TextComponent>

						{selectedVendor ? (
							// Selected Vendor Preview
							<View className="bg-secondary/30 border border-border rounded-xl p-4">
								<View className="flex-row items-center justify-between">
									<View className="flex-1">
										<TextComponent className="text-muted-foreground text-xs mb-1">
											Selected Vendor
										</TextComponent>
										<TextComponent className="text-foreground font-bold text-base">
											{selectedVendor.name}
										</TextComponent>
										{selectedVendor.email && (
											<TextComponent className="text-muted-foreground text-sm mt-0.5">
												{selectedVendor.email}
											</TextComponent>
										)}
									</View>
									{!isVendorLocked && (
										<TouchableOpacity
											onPress={handleClearVendor}
											className="bg-destructive/10 px-4 py-2.5 rounded-xl active:opacity-70">
											<TextComponent className="text-destructive font-semibold text-sm">
												Change
											</TextComponent>
										</TouchableOpacity>
									)}
								</View>
							</View>
						) : (
							// Vendor Search Input
							<View className="relative">
								<View
									className={`flex-row items-center bg-input border rounded-xl px-4 ${
										errors.vendor ? 'border-destructive' : 'border-border'
									}`}>
									<View className="mr-2">
										<SearchIcon
											size={18}
											color={colors.mutedForeground}
										/>
									</View>
									<TextInput
										ref={searchInputRef}
										className="flex-1 py-3.5 text-foreground text-base"
										placeholder="Search vendor by name..."
										placeholderTextColor={colors.mutedForeground}
										value={vendorSearchQuery}
										onChangeText={setVendorSearchQuery}
										onFocus={() => {
											if (vendorSearchQuery.length >= 2) setShowDropdown(true);
										}}
									/>
									{searchingVendors && (
										<ActivityIndicator
											size="small"
											color={colors.primary}
										/>
									)}
								</View>
								{errors.vendor && (
									<TextComponent className="text-destructive text-xs mt-1">
										Please select a vendor
									</TextComponent>
								)}

								{/* Dropdown Results */}
								{showDropdown && (
									<View className="absolute top-14 left-0 right-0 bg-card border border-border rounded-xl shadow-lg z-50 max-h-48 overflow-hidden">
										{vendorSearchResults.length > 0 ? (
											<ScrollView
												nestedScrollEnabled
												showsVerticalScrollIndicator={false}>
												{vendorSearchResults.map((admin) => (
													<Pressable
														key={admin._id}
														onPress={() => handleSelectVendor(admin)}
														className="p-3.5 border-b border-border active:bg-muted">
														<TextComponent className="text-foreground font-semibold text-sm">
															{admin.name}
														</TextComponent>
														<TextComponent className="text-muted-foreground text-xs mt-0.5">
															{admin.email}
														</TextComponent>
													</Pressable>
												))}
											</ScrollView>
										) : (
											<View className="p-4 items-center">
												<TextComponent className="text-muted-foreground text-sm">
													No vendors found.
												</TextComponent>
											</View>
										)}
									</View>
								)}
							</View>
						)}

						{!selectedVendor &&
							vendorSearchQuery.length < 2 &&
							vendorSearchQuery.length > 0 && (
								<TextComponent className="text-muted-foreground text-xs mt-2">
									Type at least 2 characters to search
								</TextComponent>
							)}
					</View>

					{/* Document Title */}
					<View className="mb-5">
						<TextComponent className="text-foreground font-semibold text-base mb-2.5">
							Title{' '}
							<TextComponent className="text-destructive">*</TextComponent>
						</TextComponent>
						<Controller
							control={control}
							name="title"
							rules={{ required: 'Document title is required' }}
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									className={`bg-input border rounded-xl px-4 py-3.5 text-foreground text-base ${
										errors.title ? 'border-destructive' : 'border-border'
									}`}
									placeholder="e.g., Final Year Thesis"
									placeholderTextColor={colors.mutedForeground}
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
								/>
							)}
						/>
						{errors.title && (
							<TextComponent className="text-destructive text-xs mt-1">
								{errors.title.message}
							</TextComponent>
						)}
					</View>

					{/* Description */}
					<View className="mb-5">
						<TextComponent className="text-foreground font-semibold text-base mb-2.5">
							Description{' '}
							<TextComponent className="text-muted-foreground text-sm font-normal">
								(Optional)
							</TextComponent>
						</TextComponent>
						<Controller
							control={control}
							name="description"
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									className="bg-input border border-border rounded-xl px-4 py-3.5 text-foreground text-base min-h-[100px]"
									placeholder="Any specific instructions or notes..."
									placeholderTextColor={colors.mutedForeground}
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									multiline
									numberOfLines={4}
									textAlignVertical="top"
								/>
							)}
						/>
					</View>

					{/* File Upload */}
					<View className="mb-6">
						<View className="flex-row items-center justify-between mb-2.5">
							<TextComponent className="text-foreground font-semibold text-base">
								Documents{' '}
								<TextComponent className="text-destructive">*</TextComponent>
							</TextComponent>
							{files.length > 0 && (
								<TouchableOpacity
									onPress={handleSelectFile}
									className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-lg active:opacity-70">
									<PlusIcon
										size={14}
										color={colors.primary}
									/>
									<TextComponent className="text-primary font-bold text-xs ml-1">
										Add File
									</TextComponent>
								</TouchableOpacity>
							)}
						</View>

						{files.length > 0 ? (
							<View className="space-y-3">
								{files.map((file, index) => (
									<View
										key={`${file.uri}-${index}`}
										className="bg-secondary/30 border border-border rounded-xl p-3">
										<View className="flex-row items-center">
											<View className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center">
												{renderFileIcon(file.mimeType, 24)}
											</View>
											<View className="flex-1 ml-3">
												<TextComponent
													className="text-foreground font-semibold text-sm"
													numberOfLines={1}>
													{file.name}
												</TextComponent>
												<View className="flex-row items-center mt-0.5">
													<TextComponent className="text-muted-foreground text-[10px]">
														{getFileTypeLabel(file.mimeType)}
													</TextComponent>
													<TextComponent className="text-muted-foreground text-[10px] mx-1.5">
														•
													</TextComponent>
													<TextComponent className="text-muted-foreground text-[10px]">
														{formatFileSize(file.size)}
													</TextComponent>
													{file.pageCount !== undefined && (
														<>
															<TextComponent className="text-muted-foreground text-[10px] mx-1.5">
																•
															</TextComponent>
															<TextComponent className="text-muted-foreground text-[10px]">
																{file.pageCount} pages
															</TextComponent>
														</>
													)}
												</View>
											</View>
											<TouchableOpacity
												onPress={() => removeFile(index)}
												className="bg-destructive/10 p-2 rounded-lg active:opacity-70 ml-2">
												<TrashIcon
													size={16}
													color={colors.destructive}
												/>
											</TouchableOpacity>
										</View>
									</View>
								))}
							</View>
						) : (
							<Pressable
								className={`border-2 border-dashed rounded-xl p-8 items-center active:opacity-80 bg-muted/30 ${
									errors.files ? 'border-destructive' : 'border-border'
								}`}
								onPress={handleSelectFile}>
								<View className="w-16 h-16 bg-primary/15 rounded-2xl items-center justify-center mb-4">
									<DocumentTextIcon
										size={32}
										color={colors.primary}
									/>
								</View>
								<TextComponent className="text-foreground font-bold text-base mb-1">
									Tap to select files
								</TextComponent>
								<TextComponent className="text-muted-foreground text-sm text-center">
									PDF, Word documents, or images up to 15MB
								</TextComponent>
							</Pressable>
						)}
						{errors.files && (
							<TextComponent className="text-destructive text-xs mt-1">
								Please select at least one file
							</TextComponent>
						)}
					</View>

					{/* Submit Button */}
					<TouchableOpacity
						className={`rounded-xl p-4 items-center flex-row justify-center ${
							loading ? 'bg-primary' : 'bg-primary'
						}`}
						onPress={handleSubmit(onSubmit)}
						disabled={loading}
						activeOpacity={0.8}>
						{loading ? (
							<>
								<ActivityIndicator
									size="small"
									color="#fff"
								/>
								<TextComponent className="text-primary-foreground font-bold text-lg ml-2">
									Submitting...
								</TextComponent>
							</>
						) : (
							<TextComponent className="text-primary-foreground font-bold text-lg">
								Submit Document
								{files.length > 1 ? `s (${files.length})` : ''}
							</TextComponent>
						)}
					</TouchableOpacity>

					{/* Cancel */}
					<TouchableOpacity
						className="mt-3 py-3 items-center"
						onPress={() => navigation.goBack()}>
						<TextComponent className="text-muted-foreground font-semibold">
							Cancel
						</TextComponent>
					</TouchableOpacity>
				</View>

				{/* Tips Section */}
				<View className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/50 mb-8">
					<View className="flex-row items-center mb-3">
						<View className="mr-2">
							<LightbulbIcon
								size={20}
								color="#1e40af"
							/>
						</View>
						<TextComponent className="font-bold text-blue-900 dark:text-blue-100">
							Submission Tips
						</TextComponent>
					</View>
					<View className="space-y-2">
						<View className="flex-row items-start">
							<TextComponent className="text-blue-600 dark:text-blue-300 mr-2">
								•
							</TextComponent>
							<TextComponent className="text-blue-800 dark:text-blue-200 text-sm flex-1">
								Ensure your files are under 15MB each
							</TextComponent>
						</View>
						<View className="flex-row items-start">
							<TextComponent className="text-blue-600 dark:text-blue-300 mr-2">
								•
							</TextComponent>
							<TextComponent className="text-blue-800 dark:text-blue-200 text-sm flex-1">
								You can upload multiple files at once
							</TextComponent>
						</View>
						<View className="flex-row items-start">
							<TextComponent className="text-blue-600 dark:text-blue-300 mr-2">
								•
							</TextComponent>
							<TextComponent className="text-blue-800 dark:text-blue-200 text-sm flex-1">
								PDFs are best for accurate page counts
							</TextComponent>
						</View>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}
