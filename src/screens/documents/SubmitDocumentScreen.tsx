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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { PDFDocument } from 'pdf-lib';
import { LinearGradient } from 'expo-linear-gradient';
import { DocumentsStackParamList } from '../../types/navigation.types';
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
} from 'src/assets/icons';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'SubmitDocument'>;

type SelectedFile = {
	uri: string;
	name: string;
	size?: number;
	mimeType?: string;
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

	// Form state
	const [selectedVendor, setSelectedVendor] = useState<AdminInfo | null>(
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
	);
	const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [pageCount, setPageCount] = useState<number | undefined>(undefined);
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
			if (response.data?.data?.admins) {
				setVendorSearchResults(response.data.data.admins);
				setShowDropdown(true);
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
			});

			if (!result.canceled && result.assets[0]) {
				const file = result.assets[0];
				setSelectedFile({
					uri: file.uri,
					name: file.name,
					size: file.size,
					mimeType: file.mimeType,
				});

				// Auto-fill title from filename if empty
				if (!title) {
					const fileName =
						file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
					setTitle(fileName);
				}

				// Get page count if it's a PDF
				if (file.mimeType?.includes('pdf')) {
					const pages = await getPdfPageCount(file.uri);
					setPageCount(pages);
				} else {
					// For non-PDF files (images), set page count to 1
					setPageCount(1);
				}
			}
		} catch (error) {
			console.error('File picker error:', error);
			onError('Error', 'Failed to select file');
		}
	};

	const handleSubmit = async () => {
		// Validation
		if (!selectedVendor) {
			onError('Validation Error', 'Please select a vendor');
			return;
		}
		if (!selectedFile) {
			onError('Validation Error', 'Please select a file');
			return;
		}
		if (!title.trim()) {
			onError('Validation Error', 'Please enter a document title');
			return;
		}

		if (!user) {
			onError('Error', 'You must be logged in to submit documents');
			return;
		}

		setLoading(true);
		try {
			const formData = new FormData();
			formData.append('title', title.trim());
			formData.append('assignedAdmin', selectedVendor._id);
			formData.append('studentName', user.name);
			formData.append('matricNumber', user.matricNumber);

			if (description.trim()) {
				formData.append('description', description.trim());
			}

			// Include page count in payload if available
			if (pageCount !== undefined) {
				formData.append('pageCount', pageCount.toString());
			}

			formData.append('file', {
				uri: selectedFile.uri,
				name: selectedFile.name,
				type: selectedFile.mimeType || 'application/octet-stream',
			} as any);

			console.log('Submitting document:', {
				title: title.trim(),
				assignedAdmin: selectedVendor._id,
				studentName: user.name,
				matricNumber: user.matricNumber,
				fileName: selectedFile.name,
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
		setSelectedVendor(vendor);
		setVendorSearchQuery('');
		setShowDropdown(false);
		Keyboard.dismiss();
	};

	const handleClearVendor = () => {
		setSelectedVendor(null);
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
						Upload and send your document to a vendor
					</TextComponent>
				</View>
			</LinearGradient>

			<View className="px-5 pt-6 pb-8 -mt-4">
				{/* Main Form Card */}
				<View className="card-3d rounded-2xl p-5 mb-5">
					{/* Vendor Selection */}
					<View className="mb-5">
						<TextComponent className="text-foreground font-semibold text-base mb-2.5">
							Select Vendor{' '}
							<TextComponent className="text-destructive">*</TextComponent>
						</TextComponent>

						{selectedVendor ? (
							// Selected Vendor Preview (like web's AdminPreview)
							<View className="bg-secondary/50 border border-border rounded-xl p-4">
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
										<Pressable
											onPress={handleClearVendor}
											className="bg-destructive/10 px-4 py-2.5 rounded-xl active:opacity-70">
											<TextComponent className="text-destructive font-semibold text-sm">
												Change
											</TextComponent>
										</Pressable>
									)}
								</View>
							</View>
						) : (
							// Vendor Search Input (like web's AdminSearchInput)
							<View className="relative">
								<View className="flex-row items-center bg-input border border-border rounded-xl px-4">
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
							Document Title{' '}
							<TextComponent className="text-destructive">*</TextComponent>
						</TextComponent>
						<TextInput
							className="bg-input border border-border rounded-xl px-4 py-3.5 text-foreground text-base"
							placeholder="e.g., Final Year Thesis"
							placeholderTextColor={colors.mutedForeground}
							value={title}
							onChangeText={setTitle}
						/>
					</View>

					{/* Description */}
					<View className="mb-5">
						<TextComponent className="text-foreground font-semibold text-base mb-2.5">
							Description{' '}
							<TextComponent className="text-muted-foreground text-sm font-normal">
								(Optional)
							</TextComponent>
						</TextComponent>
						<TextInput
							className="bg-input border border-border rounded-xl px-4 py-3.5 text-foreground text-base min-h-[100px]"
							placeholder="Any specific instructions or notes..."
							placeholderTextColor={colors.mutedForeground}
							value={description}
							onChangeText={setDescription}
							multiline
							numberOfLines={4}
							textAlignVertical="top"
						/>
					</View>

					{/* File Upload */}
					<View className="mb-6">
						<TextComponent className="text-foreground font-semibold text-base mb-2.5">
							Document{' '}
							<TextComponent className="text-destructive">*</TextComponent>
						</TextComponent>

						{selectedFile ? (
							// File Preview Card
							<View className="bg-secondary/50 border border-border rounded-xl p-4">
								<View className="flex-row items-center">
									<View className="w-14 h-14 bg-primary/10 rounded-xl items-center justify-center">
										{renderFileIcon(selectedFile.mimeType)}
									</View>
									<View className="flex-1 ml-4">
										<TextComponent
											className="text-foreground font-semibold text-base"
											numberOfLines={1}>
											{selectedFile.name}
										</TextComponent>
										<View className="flex-row items-center mt-1">
											<TextComponent className="text-muted-foreground text-xs">
												{getFileTypeLabel(selectedFile.mimeType)}
											</TextComponent>
											<TextComponent className="text-muted-foreground text-xs mx-2">
												•
											</TextComponent>
											<TextComponent className="text-muted-foreground text-xs">
												{formatFileSize(selectedFile.size)}
											</TextComponent>
										</View>
									</View>
									<Pressable
										onPress={() => {
											setSelectedFile(null);
											setPageCount(undefined);
										}}
										className="bg-destructive/10 p-2.5 rounded-xl active:opacity-70">
										<CloseIcon
											size={18}
											color={colors.destructive}
										/>
									</Pressable>
								</View>
							</View>
						) : (
							// Upload Button
							<Pressable
								className="border-2 border-dashed border-border rounded-xl p-8 items-center active:opacity-80 bg-muted/30"
								onPress={handleSelectFile}>
								<View className="w-16 h-16 bg-primary/15 rounded-2xl items-center justify-center mb-4">
									<DocumentTextIcon
										size={32}
										color={colors.primary}
									/>
								</View>
								<TextComponent className="text-foreground font-bold text-base mb-1">
									Tap to select file
								</TextComponent>
								<TextComponent className="text-muted-foreground text-sm text-center">
									PDF, Word documents, or images up to 15MB
								</TextComponent>
							</Pressable>
						)}
					</View>

					{/* Submit Button */}
					<Pressable
						className={`rounded-xl p-4 items-center flex-row justify-center ${
							loading ? 'bg-primary/70' : 'bg-primary'
						}`}
						onPress={handleSubmit}
						disabled={loading}
						style={({ pressed }) => ({
							opacity: pressed && !loading ? 0.85 : 1,
						})}>
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
							</TextComponent>
						)}
					</Pressable>

					{/* Cancel */}
					<Pressable
						className="mt-3 py-3 items-center"
						onPress={() => navigation.goBack()}>
						<TextComponent className="text-muted-foreground font-semibold">
							Cancel
						</TextComponent>
					</Pressable>
				</View>

				{/* Tips Section */}
				<View className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/50">
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
								Ensure your file is under 15MB
							</TextComponent>
						</View>
						<View className="flex-row items-start">
							<TextComponent className="text-blue-600 dark:text-blue-300 mr-2">
								•
							</TextComponent>
							<TextComponent className="text-blue-800 dark:text-blue-200 text-sm flex-1">
								PDFs are recommended for page counting accuracy
							</TextComponent>
						</View>
						<View className="flex-row items-start">
							<TextComponent className="text-blue-600 dark:text-blue-300 mr-2">
								•
							</TextComponent>
							<TextComponent className="text-blue-800 dark:text-blue-200 text-sm flex-1">
								Provide clear instructions in the description
							</TextComponent>
						</View>
						<View className="flex-row items-start">
							<Text className="text-blue-600 dark:text-blue-300 mr-2">•</Text>
							<Text className="text-blue-800 dark:text-blue-200 text-sm flex-1">
								Double-check the selected vendor
							</Text>
						</View>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}
