import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Keyboard,
	Pressable,
	ScrollView,
	StatusBar,
	TextInput,
	View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { PDFDocument } from 'pdf-lib';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller, useForm } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';
import { useQueryClient } from '@tanstack/react-query';
import {
	DocumentsStackParamList,
	VendorsStackParamList,
} from '../../types/navigation.types';
import { searchAdmins, initiateDirectUpload, completeDirectUpload } from '../../api/projects';
import { useTheme } from '../../providers/ThemeProvider';
import { useUserStore } from '../../shared/user-store/useUserStore';
import { onError } from '../../utils/toast';
import { sendNotification } from '../../api/notifications';
import { showMessage } from 'react-native-flash-message';
import TextComponent from '../../components/ui/TextComponent';
import {
	CloseIcon,
	DocumentTextIcon,
	FileImageIcon,
	FilePdfIcon,
	FileWordIcon,
	PlusIcon,
	SearchIcon,
	TrashIcon,
	UploadIcon,
} from '../../assets/icons';

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

const SectionHeading = memo(function SectionHeading({
	label,
	required = false,
	supportingText,
}: {
	label: string;
	required?: boolean;
	supportingText?: string;
}) {
	return (
		<View className="mb-2">
			<TextComponent className="text-sm font-bold text-foreground">
				{label}
				{required ? (
					<TextComponent className="text-sm font-bold text-destructive">
						{' '}
						*
					</TextComponent>
				) : null}
			</TextComponent>
			{supportingText ? (
				<TextComponent className="mt-0.5 text-xs leading-5 text-muted-foreground">
					{supportingText}
				</TextComponent>
			) : null}
		</View>
	);
});

function SubmitDocumentScreen({
	navigation,
	route,
}: Props) {
	const {
		vendorId,
		vendorName,
		vendorEmail,
		vendorProfilePicture,
		vendorPrintingCost,
		vendorRating,
		isVendorLocked,
	} = route.params || {};

	const { colors, colorScheme } = useTheme();
	const { user } = useUserStore();
	const queryClient = useQueryClient();
	const searchInputRef = useRef<TextInput>(null);

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
	const [uploadStatus, setUploadStatus] = useState('');
	const [uploadProgress, setUploadProgress] = useState(0);
	const [vendorSearchQuery, setVendorSearchQuery] = useState('');
	const [vendorSearchResults, setVendorSearchResults] = useState<AdminInfo[]>([]);
	const [searchingVendors, setSearchingVendors] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);

	const getPdfPageCount = useCallback(
		async (fileUri: string): Promise<number | undefined> => {
			try {
				const base64 = await FileSystem.readAsStringAsync(fileUri, {
					encoding: FileSystem.EncodingType.Base64,
				});

				const binaryString = atob(base64);
				const bytes = new Uint8Array(binaryString.length);

				for (let i = 0; i < binaryString.length; i += 1) {
					bytes[i] = binaryString.charCodeAt(i);
				}

				const pdfDoc = await PDFDocument.load(bytes, {
					ignoreEncryption: true,
				});

				return pdfDoc.getPageCount();
			} catch (error) {
				console.error('Error getting PDF page count:', error);
				return undefined;
			}
		},
		[],
	);

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
				setVendorSearchResults(response.data.data.admins);
				setShowDropdown(true);
			} else if (Array.isArray(response)) {
				setVendorSearchResults(response);
				setShowDropdown(true);
			} else {
				setVendorSearchResults([]);
			}
		} catch (error) {
			console.error('Vendor search error:', error);
			setVendorSearchResults([]);
		} finally {
			setSearchingVendors(false);
		}
	}, 450);

	useEffect(() => {
		debouncedSearch(vendorSearchQuery);
	}, [debouncedSearch, vendorSearchQuery]);

	const handleSelectFile = useCallback(async () => {
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

			if (result.canceled || !result.assets) {
				return;
			}

			const newFiles: SelectedFile[] = [];

			for (const file of result.assets) {
				if (files.some((existingFile) => existingFile.uri === file.uri)) {
					continue;
				}

				const nextFile: SelectedFile = {
					uri: file.uri,
					name: file.name,
					size: file.size,
					mimeType: file.mimeType,
				};

				if (file.mimeType?.includes('pdf')) {
					nextFile.pageCount = await getPdfPageCount(file.uri);
				} else {
					nextFile.pageCount = 1;
				}

				newFiles.push(nextFile);
			}

			const currentTitle = watch('title');
			if (!currentTitle && newFiles.length > 0) {
				const firstFile = newFiles[0];
				const fileName =
					firstFile.name.substring(0, firstFile.name.lastIndexOf('.')) ||
					firstFile.name;
				setValue('title', fileName);
			}

			setValue('files', [...files, ...newFiles]);
		} catch (error) {
			console.error('File picker error:', error);
			onError('Error', 'Failed to select file');
		}
	}, [files, getPdfPageCount, setValue, watch]);

	const handleRemoveFile = useCallback(
		(index: number) => {
			const nextFiles = [...files];
			nextFiles.splice(index, 1);
			setValue('files', nextFiles);
		},
		[files, setValue],
	);

	const handleSelectVendor = useCallback(
		(vendor: AdminInfo) => {
			setValue('vendor', vendor);
			setVendorSearchQuery('');
			setShowDropdown(false);
			Keyboard.dismiss();
		},
		[setValue],
	);

	const handleClearVendor = useCallback(() => {
		setValue('vendor', null);
		setVendorSearchQuery('');
		setShowDropdown(false);
		searchInputRef.current?.focus();
	}, [setValue]);

	const formatFileSize = useCallback((bytes?: number) => {
		if (!bytes) return 'Size unknown';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
	}, []);

	const renderFileIcon = useCallback(
		(mimeType?: string, size: number = 28) => {
			if (mimeType?.includes('pdf')) {
				return (
					<FilePdfIcon
						size={size}
						color={colors.primary}
					/>
				);
			}

			if (mimeType?.includes('word') || mimeType?.includes('document')) {
				return (
					<FileWordIcon
						size={size}
						color={colors.primary}
					/>
				);
			}

			if (mimeType?.includes('image')) {
				return (
					<FileImageIcon
						size={size}
						color={colors.primary}
					/>
				);
			}

			return (
				<DocumentTextIcon
					size={size}
					color={colors.primary}
				/>
			);
		},
		[colors.primary],
	);

	const getFileTypeLabel = useCallback((mimeType?: string) => {
		if (mimeType?.includes('pdf')) return 'PDF';
		if (mimeType?.includes('word') || mimeType?.includes('document')) {
			return 'Word';
		}
		if (mimeType?.includes('image')) return 'Image';
		return 'Document';
	}, []);

	const filesSummary = useMemo(() => {
		const totalPages = files.reduce(
			(count, file) => count + (file.pageCount || 0),
			0,
		);

		return {
			count: files.length,
			totalPages,
		};
	}, [files]);

	const handleVendorSearchFocus = useCallback(() => {
		if (vendorSearchQuery.length >= 2) {
			setShowDropdown(true);
		}
	}, [vendorSearchQuery.length]);

	const handleVendorSearchChange = useCallback((value: string) => {
		setVendorSearchQuery(value);
	}, []);

	const handleCancel = useCallback(() => {
		navigation.goBack();
	}, [navigation]);

	const onSubmit = useCallback(
		async (data: FormValues) => {
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
			setUploadStatus('Preparing files for secure upload...');
			setUploadProgress(0);

			try {
				// 1. Initiate upload
				const fileMetadata = data.files.map((file) => ({
					originalName: file.name,
					mimeType: file.mimeType || 'application/octet-stream',
					size: file.size || 0,
				}));

				const initiateRes = await initiateDirectUpload(fileMetadata);
				if (!initiateRes.data.success) {
					throw new Error(initiateRes.data.message || 'Failed to initiate upload');
				}

				const { uploads } = initiateRes.data.data;
				const uploadedFiles: {
					key: string;
					originalName: string;
					mimeType: string;
					size: number;
				}[] = [];

				// 2. Upload file bytes to signed PUT URLs (mapped by index from initiateDirectUpload)
				for (let i = 0; i < data.files.length; i += 1) {
					const file = data.files[i];
					const uploadInfo = uploads[i];

					if (!uploadInfo) {
						throw new Error(`Upload info missing for file: ${file.name}`);
					}

					setUploadStatus(`Uploading ${file.name}...`);

					const headers = {
						'Content-Type': file.mimeType || 'application/octet-stream',
						...(uploadInfo.headers || {}),
					};

					const uploadTask = await FileSystem.uploadAsync(
						uploadInfo.uploadUrl,
						file.uri,
						{
							httpMethod: 'PUT',
							headers,
							uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
						},
					);

					if (uploadTask.status < 200 || uploadTask.status >= 300) {
						console.error('R2 Direct Upload PUT failed:', uploadTask);
						throw new Error(`Failed to upload ${file.name} to storage.`);
					}

					const nextProgress = Math.round(((i + 1) / data.files.length) * 100);
					setUploadProgress(nextProgress);

					uploadedFiles.push({
						key: uploadInfo.key,
						originalName: file.name,
						mimeType: file.mimeType || 'application/octet-stream',
						size: file.size || 0,
					});
				}

				// 3. Complete registration
				setUploadStatus('Finalizing submission...');

				const totalPageCount = data.files.reduce((count, file) => {
					return count + (file.pageCount || 0);
				}, 0);

				const completePayload = {
					title: data.title.trim(),
					assignedAdmin: data.vendor._id,
					description: data.description.trim() || undefined,
					pageCount: totalPageCount,
					files: uploadedFiles,
				};

				const completeRes = await completeDirectUpload(completePayload);
				if (!completeRes.data.success) {
					throw new Error(completeRes.data.message || 'Failed to finalize upload');
				}

				// 4. Send notification
				try {
					const docName = data.title.trim() || data.files[0]?.name || 'document';
					await sendNotification(
						data.vendor._id,
						user.name,
						`has submitted a document "${docName}"`,
					);
				} catch (notificationError) {
					console.error('Failed to send notification:', notificationError);
				}

				showMessage({
					message: 'Success',
					description: 'Document submitted successfully!',
					type: 'success',
					icon: 'success',
				});

				queryClient.invalidateQueries({ queryKey: ['studentProjects'] });
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
		},
		[navigation, queryClient, user],
	);

	return (
		<View className="flex-1 bg-background">
			<StatusBar
				barStyle="light-content"
				backgroundColor="transparent"
				translucent
			/>

			{/* LinearGradient Header: Compact and Slim */}
			<LinearGradient
				colors={[colors.primary, colors.accent]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				className="rounded-b-2xl px-5 pb-5 pt-14 shadow-sm">
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<View className="mr-3 rounded-lg bg-white/15 p-2.5">
							<UploadIcon
								size={22}
								color="#fff"
							/>
						</View>
						<View>
							<TextComponent className="text-[10px] font-bold uppercase tracking-[0.8px] text-white/60">
								Document intake
							</TextComponent>
							<TextComponent className="text-xl font-extrabold tracking-tight text-white leading-6">
								Submit documents
							</TextComponent>
						</View>
					</View>

					<Pressable
						onPress={handleCancel}
						className="min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-white/12 active:opacity-95">
						<CloseIcon
							size={16}
							color="#FFFFFF"
						/>
					</Pressable>
				</View>

				<TextComponent className="mt-3 text-xs leading-5 text-white/75">
					Choose who should receive the submission, give it a clear name, and
					upload every file needed for review.
				</TextComponent>
			</LinearGradient>

			<ScrollView
				className="flex-1"
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 40 }}>
				<View className="px-5 py-6 space-y-6">
					{/* Submission Overview Block */}
					<View className="rounded-xl border border-border bg-card p-4 shadow-sm">
						<TextComponent className="text-xs font-bold uppercase tracking-[1px] text-muted-foreground">
							Submission overview
						</TextComponent>
						<View className="mt-3 flex-row gap-3">
							<View className="flex-1 rounded-lg bg-background border border-border/40 p-3 items-center">
								<TextComponent className="text-[10px] font-bold uppercase tracking-[0.8px] text-muted-foreground">
									Files
								</TextComponent>
								<TextComponent className="mt-1 text-2xl font-black text-foreground">
									{filesSummary.count}
								</TextComponent>
							</View>
							<View className="flex-1 rounded-lg bg-background border border-border/40 p-3 items-center">
								<TextComponent className="text-[10px] font-bold uppercase tracking-[0.8px] text-muted-foreground">
									Pages
								</TextComponent>
								<TextComponent className="mt-1 text-2xl font-black text-foreground">
									{filesSummary.totalPages}
								</TextComponent>
							</View>
						</View>
					</View>

					{/* Recipient Selection Section */}
					<View>
						<SectionHeading
							label="Recipient"
							required
							supportingText="Pick the vendor or team who should handle this submission."
						/>

						{selectedVendor ? (
							<View className="rounded-xl border border-border bg-card px-4 py-3">
								<View className="flex-row items-center justify-between">
									<View className="flex-1 pr-3">
										<TextComponent className="text-[10px] font-bold uppercase tracking-[0.8px] text-muted-foreground">
											Selected vendor
										</TextComponent>
										<TextComponent className="mt-1 text-base font-extrabold text-foreground">
											{selectedVendor.name}
										</TextComponent>
									</View>

									{!isVendorLocked ? (
										<Pressable
											onPress={handleClearVendor}
											className="min-h-[38px] items-center justify-center rounded-lg border border-border bg-background px-4 py-1.5 active:opacity-90">
											<TextComponent className="text-xs font-bold uppercase tracking-[0.8px] text-primary">
												Change
											</TextComponent>
										</Pressable>
									) : null}
								</View>
							</View>
						) : (
							<View className="relative">
								<View
									className={`flex-row items-center rounded-xl border bg-card px-4 ${
										errors.vendor ? 'border-destructive' : 'border-border'
									}`}>
									<SearchIcon
										size={18}
										color={colors.mutedForeground}
									/>
									<TextInput
										ref={searchInputRef}
										className="flex-1 px-3 py-3 text-base text-foreground"
										placeholder="Search recipient name"
										placeholderTextColor={colors.mutedForeground}
										value={vendorSearchQuery}
										onChangeText={handleVendorSearchChange}
										onFocus={handleVendorSearchFocus}
									/>
									{searchingVendors ? (
										<ActivityIndicator
											size="small"
											color={colors.primary}
										/>
									) : null}
								</View>

								{errors.vendor ? (
									<TextComponent className="mt-1.5 text-xs text-destructive px-1">
										Please select a recipient
									</TextComponent>
								) : null}

								{showDropdown ? (
									<View className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
										{vendorSearchResults.length > 0 ? (
											<ScrollView
												nestedScrollEnabled
												showsVerticalScrollIndicator={false}
												contentContainerStyle={{ paddingVertical: 6 }}>
												{vendorSearchResults.map((admin) => (
													<Pressable
														key={admin._id}
														onPress={() => handleSelectVendor(admin)}
														className="px-4 py-3 active:bg-muted">
														<TextComponent className="text-sm font-semibold text-foreground">
															{admin.name}
														</TextComponent>
													</Pressable>
												))}
											</ScrollView>
										) : (
											<View className="px-4 py-4">
												<TextComponent className="text-sm text-muted-foreground">
													No recipients found.
												</TextComponent>
											</View>
										)}
									</View>
								) : null}
							</View>
						)}

						{!selectedVendor &&
						vendorSearchQuery.length > 0 &&
						vendorSearchQuery.length < 2 ? (
							<TextComponent className="mt-2 text-xs text-muted-foreground px-1">
								Type at least 2 characters to search recipients.
							</TextComponent>
						) : null}
					</View>

					{/* Document Title Section */}
					<View>
						<SectionHeading
							label="Document title"
							required
							supportingText="Use a clear title the recipient can recognize quickly."
						/>
						<Controller
							control={control}
							name="title"
							rules={{ required: 'Document title is required' }}
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									className={`rounded-xl border bg-card px-4 py-3 text-base text-foreground ${
										errors.title ? 'border-destructive' : 'border-border'
									}`}
									placeholder="Example: Final year project print request"
									placeholderTextColor={colors.mutedForeground}
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
								/>
							)}
						/>
						{errors.title ? (
							<TextComponent className="mt-1.5 text-xs text-destructive px-1">
								{errors.title.message}
							</TextComponent>
						) : null}
					</View>

					{/* Description Section */}
					<View>
						<SectionHeading
							label="Description"
							supportingText="Add any handling notes, delivery context, or instructions for the recipient."
						/>
						<Controller
							control={control}
							name="description"
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									className="min-h-[100px] rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground"
									placeholder="Example: These files belong to the April admissions batch and should be reviewed together."
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

					{/* Files Upload Section */}
					<View>
						<View className="flex-row items-center justify-between mb-3">
							<View className="flex-1">
								<TextComponent className="text-sm font-bold text-foreground">
									Files <TextComponent className="text-destructive">*</TextComponent>
								</TextComponent>
								<TextComponent className="mt-0.5 text-xs text-muted-foreground">
									Upload PDFs, Word files, or images for review.
								</TextComponent>
							</View>

							{files.length > 0 ? (
								<Pressable
									onPress={handleSelectFile}
									className="min-h-[38px] flex-row items-center rounded-lg border border-border bg-card px-3 py-1.5 active:opacity-90">
									<PlusIcon
										size={12}
										color={colors.primary}
									/>
									<TextComponent className="ml-1 text-xs font-bold uppercase tracking-[0.8px] text-primary">
										Add file
									</TextComponent>
								</Pressable>
							) : null}
						</View>

						{files.length > 0 ? (
							<View>
								{files.map((file, index) => (
									<View
										key={`${file.uri}-${index}`}
										className="mb-3 rounded-xl border border-border bg-card px-3.5 py-3 shadow-sm">
										<View className="flex-row items-center">
											<View
												className="mr-3 h-10 w-10 items-center justify-center rounded-lg"
												style={{
													backgroundColor:
														colorScheme === 'dark'
															? `${colors.primary}18`
															: `${colors.primary}12`,
												}}>
												{renderFileIcon(file.mimeType, 20)}
											</View>

											<View className="flex-1">
												<TextComponent
													className="text-sm font-bold text-foreground"
													numberOfLines={1}>
													{file.name}
												</TextComponent>
												<TextComponent className="mt-0.5 text-xs text-muted-foreground">
													{getFileTypeLabel(file.mimeType)} • {formatFileSize(file.size)}
													{file.pageCount !== undefined
														? ` • ${file.pageCount} pages`
														: ''}
												</TextComponent>
											</View>

											<Pressable
												onPress={() => handleRemoveFile(index)}
												className="ml-3 h-9 w-9 items-center justify-center rounded-lg"
												style={{
													backgroundColor:
														colorScheme === 'dark'
															? 'rgba(239, 68, 68, 0.14)'
															: '#fee2e2',
												}}>
												<TrashIcon
													size={14}
													color={colors.destructive}
												/>
											</Pressable>
										</View>
									</View>
								))}
							</View>
						) : (
							<Pressable
								className={`items-center rounded-xl border-2 border-dashed px-5 py-8 ${
									errors.files ? 'border-destructive' : 'border-border'
								}`}
								style={{
									backgroundColor:
										colorScheme === 'dark'
											? 'rgba(255,255,255,0.02)'
											: colors.muted,
								}}
								onPress={handleSelectFile}>
								<View
									className="mb-3 h-14 w-14 items-center justify-center rounded-xl"
									style={{ backgroundColor: `${colors.primary}12` }}>
									<DocumentTextIcon
										size={26}
										color={colors.primary}
									/>
								</View>
								<TextComponent className="text-sm font-bold text-foreground">
									Select files to upload
								</TextComponent>
								<TextComponent className="mt-1 text-center text-xs leading-5 text-muted-foreground">
									Add PDF, Word, or image files for this request.
								</TextComponent>
							</Pressable>
						)}

						{errors.files ? (
							<TextComponent className="mt-1.5 text-xs text-destructive px-1">
								Please select at least one file
							</TextComponent>
						) : null}
					</View>

					{/* Action Buttons */}
					<View className="pt-2">
						<Pressable
							className="min-h-[50px] flex-row items-center justify-center rounded-xl bg-primary active:opacity-90 shadow-sm"
							onPress={handleSubmit(onSubmit)}
							disabled={loading}>
							{loading ? (
								<>
									<ActivityIndicator
										size="small"
										color="#fff"
									/>
									<TextComponent className="ml-2 text-base font-bold text-primary-foreground">
										Submitting...
									</TextComponent>
								</>
							) : (
								<TextComponent className="text-base font-bold text-primary-foreground">
									Submit document{files.length > 1 ? `s (${files.length})` : ''}
								</TextComponent>
							)}
						</Pressable>

						<Pressable
							className="mt-3 min-h-[44px] items-center justify-center rounded-xl border border-border bg-card active:opacity-90"
							onPress={handleCancel}>
							<TextComponent className="font-semibold text-foreground text-sm">
								Cancel
							</TextComponent>
						</Pressable>
					</View>
				</View>
			</ScrollView>

			{/* Submitting Status Modal */}
			{loading ? (
				<View className="absolute inset-0 bg-black/65 items-center justify-center z-50 px-6">
					<View className="bg-card w-full max-w-xs rounded-xl p-5 border border-border items-center shadow-2xl">
						<ActivityIndicator size="large" color={colors.primary} className="mb-4" />
						<TextComponent className="text-base font-bold text-foreground text-center mb-1">
							Submitting Documents
						</TextComponent>
						<TextComponent className="text-xs text-muted-foreground text-center mb-4">
							{uploadStatus}
						</TextComponent>
						{uploadProgress > 0 ? (
							<View className="w-full bg-muted h-2 rounded-full overflow-hidden mb-2">
								<View
									className="bg-primary h-full rounded-full"
									style={{ width: `${uploadProgress}%` }}
								/>
							</View>
						) : null}
						{uploadProgress > 0 ? (
							<TextComponent className="text-xs font-semibold text-primary">
								{uploadProgress}%
							</TextComponent>
						) : null}
					</View>
				</View>
			) : null}
		</View>
	);
}

export default SubmitDocumentScreen;
