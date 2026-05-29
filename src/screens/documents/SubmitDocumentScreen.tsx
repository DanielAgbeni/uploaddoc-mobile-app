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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
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

const MAX_SELECTED_FILES = 10;
const UPLOAD_CACHE_FOLDER = 'direct-upload-cache';

const sanitizeCacheFileName = (name: string) =>
	name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'upload';

const getFileTitle = (name: string) => name.trim() || 'document';

const getUriScheme = (uri?: string) => {
	const match = uri?.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
	return match?.[1] || 'unknown';
};

const logUploadDebug = (step: string, details?: Record<string, unknown>) => {
	console.log(`[SubmitDocument] ${step}`, details || {});
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
	const insets = useSafeAreaInsets();
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

	// Page count is computed accurately on the server during upload processing.
	// We default to 1 here to avoid reading entire PDFs into memory on the client,
	// which causes OOM crashes when selecting multiple files.
	const getPdfPageCount = useCallback(
		async (_fileUri: string): Promise<number> => {
			return 1;
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

	useEffect(() => {
		if (vendorId && vendorName) {
			setValue('vendor', {
				_id: vendorId,
				name: vendorName,
				email: vendorEmail || '',
				profilePicture: vendorProfilePicture ?? undefined,
				printingCost: vendorPrintingCost ?? undefined,
				rating: vendorRating,
			});
		} else if (vendorId === undefined) {
			setValue('vendor', null);
		}
	}, [
		vendorId,
		vendorName,
		vendorEmail,
		vendorProfilePicture,
		vendorPrintingCost,
		vendorRating,
		setValue,
	]);

	const handleSelectFile = useCallback(async () => {
		try {
			logUploadDebug('picker:open', {
				currentFileCount: files.length,
				maxFiles: MAX_SELECTED_FILES,
			});

			const result = await DocumentPicker.getDocumentAsync({
				type: [
					'application/pdf',
					'application/msword',
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
					'image/*',
				],
				copyToCacheDirectory: false,
				multiple: false,
				base64: false,
			});

			logUploadDebug('picker:result', {
				canceled: result.canceled,
				assetCount: result.assets?.length || 0,
			});

			if (result.canceled || !result.assets) {
				logUploadDebug('picker:cancelled');
				return;
			}

			const remainingSlots = MAX_SELECTED_FILES - files.length;

			if (remainingSlots <= 0) {
				onError('Upload limit reached', `You can upload up to ${MAX_SELECTED_FILES} files at a time.`);
				return;
			}

			const newFiles: SelectedFile[] = [];

			for (const [index, file] of result.assets.entries()) {
				logUploadDebug('picker:asset', {
					index,
					name: file.name,
					mimeType: file.mimeType,
					size: file.size,
					uriScheme: getUriScheme(file.uri),
					uriLength: file.uri.length,
				});

				if (files.some((existingFile) => existingFile.uri === file.uri)) {
					logUploadDebug('picker:asset-skipped-duplicate', {
						index,
						name: file.name,
					});
					continue;
				}

				if (newFiles.length >= remainingSlots) {
					logUploadDebug('picker:asset-skipped-limit', {
						index,
						name: file.name,
					});
					break;
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
				logUploadDebug('picker:asset-added', {
					index,
					name: nextFile.name,
					newFileCount: newFiles.length,
				});
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
			logUploadDebug('picker:state-updated', {
				previousFileCount: files.length,
				addedFileCount: newFiles.length,
				totalFileCount: files.length + newFiles.length,
			});

			const skippedCount = result.assets.length - newFiles.length;
			if (skippedCount > 0 && files.length + newFiles.length >= MAX_SELECTED_FILES) {
				onError('Upload limit reached', `Only the first ${MAX_SELECTED_FILES} files were selected.`);
			}
		} catch (error) {
			console.error('[SubmitDocument] picker:error', error);
			onError('Error', 'Failed to select file');
		}
	}, [files, getPdfPageCount, setValue, watch]);

	const prepareFileForUpload = useCallback(
		async (file: SelectedFile, index: number) => {
			logUploadDebug('prepare:start', {
				index,
				name: file.name,
				mimeType: file.mimeType,
				size: file.size,
				uriScheme: getUriScheme(file.uri),
				uriLength: file.uri.length,
			});

			if (file.uri.startsWith('file://')) {
				logUploadDebug('prepare:already-file-uri', {
					index,
					name: file.name,
				});

				return {
					uri: file.uri,
					shouldCleanup: false,
				};
			}

			if (!FileSystem.cacheDirectory) {
				throw new Error(`Unable to prepare ${file.name} for upload.`);
			}

			const uploadCacheDirectory = `${FileSystem.cacheDirectory}${UPLOAD_CACHE_FOLDER}/`;
			logUploadDebug('prepare:ensure-cache-directory', {
				index,
				cacheDirectory: uploadCacheDirectory,
			});

			await FileSystem.makeDirectoryAsync(uploadCacheDirectory, {
				intermediates: true,
			});

			const destination = `${uploadCacheDirectory}${Date.now()}-${index}-${sanitizeCacheFileName(file.name)}`;
			logUploadDebug('prepare:copy-start', {
				index,
				name: file.name,
				fromScheme: getUriScheme(file.uri),
				toScheme: getUriScheme(destination),
			});

			await FileSystem.copyAsync({
				from: file.uri,
				to: destination,
			});

			logUploadDebug('prepare:copy-complete', {
				index,
				name: file.name,
				destinationScheme: getUriScheme(destination),
			});

			return {
				uri: destination,
				shouldCleanup: true,
			};
		},
		[],
	);

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
			logUploadDebug('submit:start', {
				fileCount: data.files.length,
				hasVendor: Boolean(data.vendor),
				hasUser: Boolean(user),
				titleLength: data.title.trim().length,
			});

			if (!user) {
				logUploadDebug('submit:blocked-no-user');
				onError('Error', 'You must be logged in to submit documents');
				return;
			}

			if (!data.vendor) {
				logUploadDebug('submit:blocked-no-vendor');
				onError('Validation Error', 'Please select a vendor');
				return;
			}

			if (data.files.length === 0) {
				logUploadDebug('submit:blocked-no-files');
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

				logUploadDebug('upload:initiate:start', {
					fileCount: fileMetadata.length,
					files: fileMetadata.map((file, index) => ({
						index,
						name: file.originalName,
						mimeType: file.mimeType,
						size: file.size,
					})),
				});

				const initiateRes = await initiateDirectUpload(fileMetadata);
				logUploadDebug('upload:initiate:response', {
					success: initiateRes.data.success,
					uploadCount: initiateRes.data.data?.uploads?.length || 0,
					message: initiateRes.data.message,
				});

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
						logUploadDebug('upload:file-missing-info', {
							index: i,
							name: file.name,
						});
						throw new Error(`Upload info missing for file: ${file.name}`);
					}

					setUploadStatus(`Uploading ${file.name}...`);
					logUploadDebug('upload:file:start', {
						index: i,
						name: file.name,
						mimeType: file.mimeType,
						size: file.size,
						uriScheme: getUriScheme(file.uri),
						hasHeaders: Boolean(uploadInfo.headers),
					});

					const headers = {
						'Content-Type': file.mimeType || 'application/octet-stream',
						...(uploadInfo.headers || {}),
					};

					const preparedFile = await prepareFileForUpload(file, i);
					let uploadTask: FileSystem.FileSystemUploadResult;

					try {
						uploadTask = await FileSystem.uploadAsync(
							uploadInfo.uploadUrl,
							preparedFile.uri,
							{
								httpMethod: 'PUT',
								headers,
								uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
							},
						);
					} finally {
						if (preparedFile.shouldCleanup) {
							logUploadDebug('prepare:cleanup-start', {
								index: i,
								name: file.name,
							});

							await FileSystem.deleteAsync(preparedFile.uri, {
								idempotent: true,
							}).catch((cleanupError) => {
								console.warn('Failed to delete temporary upload file:', cleanupError);
							});

							logUploadDebug('prepare:cleanup-complete', {
								index: i,
								name: file.name,
							});
						}
					}

					logUploadDebug('upload:file:response', {
						index: i,
						name: file.name,
						status: uploadTask.status,
					});

					if (uploadTask.status < 200 || uploadTask.status >= 300) {
						console.error('R2 Direct Upload PUT failed:', uploadTask);
						throw new Error(`Failed to upload ${file.name} to storage.`);
					}

					const nextProgress = Math.round(((i + 1) / data.files.length) * 100);
					setUploadProgress(nextProgress);
					logUploadDebug('upload:file:progress', {
						index: i,
						name: file.name,
						progress: nextProgress,
					});

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

				if (uploadedFiles.length > 1) {
					for (let i = 0; i < uploadedFiles.length; i += 1) {
						const uploadedFile = uploadedFiles[i];
						const sourceFile = data.files[i];
						const completePayload = {
							title: getFileTitle(uploadedFile.originalName),
							assignedAdmin: data.vendor._id,
							description: data.description.trim() || undefined,
							pageCount: sourceFile?.pageCount || 1,
							files: [uploadedFile],
						};

						logUploadDebug('upload:complete:file:start', {
							index: i,
							title: completePayload.title,
							fileName: uploadedFile.originalName,
							pageCount: completePayload.pageCount,
							hasDescription: Boolean(completePayload.description),
						});

						const completeRes = await completeDirectUpload(completePayload);
						logUploadDebug('upload:complete:file:response', {
							index: i,
							success: completeRes.data.success,
							message: completeRes.data.message,
						});

						if (!completeRes.data.success) {
							throw new Error(
								completeRes.data.message ||
									`Failed to finalize ${uploadedFile.originalName}`,
							);
						}
					}
				} else {
					const completePayload = {
						title: data.title.trim() || getFileTitle(uploadedFiles[0]?.originalName),
						assignedAdmin: data.vendor._id,
						description: data.description.trim() || undefined,
						pageCount: totalPageCount,
						files: uploadedFiles,
					};

					logUploadDebug('upload:complete:start', {
						fileCount: uploadedFiles.length,
						title: completePayload.title,
						pageCount: totalPageCount,
						hasDescription: Boolean(completePayload.description),
					});

					const completeRes = await completeDirectUpload(completePayload);
					logUploadDebug('upload:complete:response', {
						success: completeRes.data.success,
						message: completeRes.data.message,
					});

					if (!completeRes.data.success) {
						throw new Error(completeRes.data.message || 'Failed to finalize upload');
					}
				}

				// 4. Send notification
				try {
					const docName =
						data.files.length > 1
							? `${data.files.length} documents`
							: data.title.trim() || data.files[0]?.name || 'document';
					logUploadDebug('notification:start', {
						vendorId: data.vendor._id,
						docName,
					});

					await sendNotification(
						data.vendor._id,
						user.name,
						`has submitted a document "${docName}"`,
					);
					logUploadDebug('notification:success');
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
				console.error('[SubmitDocument] submit:error', error);
				const message =
					error?.response?.data?.message ||
					error?.message ||
					'Failed to submit document';
				onError('Error', message);
			} finally {
				logUploadDebug('submit:finished');
				setLoading(false);
			}
		},
		[navigation, prepareFileForUpload, queryClient, user],
	);

	return (
		<View className="flex-1 bg-background">
			<StatusBar
				barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
				backgroundColor="transparent"
				translucent
			/>

			{/* Clean Neutral Header */}
			<View 
				className="px-5 pb-5 border-b border-border/50 bg-background"
				style={{ paddingTop: insets.top + 16 }}>
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<View className="mr-3 rounded-lg bg-primary/10 border border-primary/20 p-2">
							<UploadIcon
								size={18}
								color={colors.primary}
							/>
						</View>
						<View>
							<TextComponent className="text-[10px] font-bold uppercase tracking-[0.8px] text-muted-foreground">
								Document intake
							</TextComponent>
							<TextComponent className="text-xl font-extrabold tracking-tight text-foreground leading-6">
								Submit Documents
							</TextComponent>
						</View>
					</View>

					<Pressable
						onPress={handleCancel}
						className="h-8 w-8 items-center justify-center rounded-full bg-card border border-border active:opacity-75">
						<CloseIcon
							size={14}
							color={colors.foreground}
						/>
					</Pressable>
				</View>

				<TextComponent 
					className="mt-3 text-xs leading-5 text-foreground font-semibold"
					style={{ opacity: 0.65 }}>
					Choose who should receive the submission, give it a clear name, and upload every file needed for review.
				</TextComponent>
			</View>

			<ScrollView
				className="flex-1"
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 110 : 120 }}>
				<View className="px-5 py-6">
					{/* Single Unified Form Card */}
					<View className="rounded-[28px] border border-border bg-card p-6 shadow-sm mb-6">
						
						{/* Select Vendor Section */}
						<View className="mb-5">
							<TextComponent className="text-sm font-bold text-foreground mb-2">
								Select Vendor <TextComponent className="text-destructive">*</TextComponent>
							</TextComponent>

							{selectedVendor ? (
								<View className="rounded-xl border border-border bg-background px-4 py-3.5 flex-row items-center justify-between">
									<View className="flex-1 pr-3">
										<TextComponent className="text-base font-extrabold text-foreground">
											{selectedVendor.name}
										</TextComponent>
									</View>

									{!isVendorLocked ? (
										<Pressable
											onPress={handleClearVendor}
											className="min-h-[36px] items-center justify-center rounded-xl border border-border bg-card px-4 py-1.5 active:opacity-90"
											style={({ pressed }) => ({
												transform: [{ scale: pressed ? 0.95 : 1 }],
											})}>
											<TextComponent className="text-xs font-bold uppercase tracking-[0.8px] text-white">
												Change
											</TextComponent>
										</Pressable>
									) : null}
								</View>
							) : (
								<View className="relative">
									<View
										className={`flex-row items-center rounded-xl border bg-background px-4 ${
											errors.vendor ? 'border-destructive' : 'border-border/60'
										}`}>
										<SearchIcon
											size={18}
											color={colors.mutedForeground}
										/>
										<TextInput
											ref={searchInputRef}
											className="flex-1 px-3 py-3.5 text-base text-foreground"
											placeholder="Search vendor by name..."
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
											Please select a vendor
										</TextComponent>
									) : null}

									{showDropdown ? (
										<View className="absolute left-0 right-0 top-[54px] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
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
															<TextComponent className="text-sm font-bold text-foreground">
																{admin.name}
															</TextComponent>
														</Pressable>
													))}
												</ScrollView>
											) : (
												<View className="px-4 py-4">
													<TextComponent className="text-sm text-muted-foreground font-semibold">
														No vendors found.
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
								<TextComponent className="mt-2 text-xs text-muted-foreground px-1 font-semibold">
									Type at least 2 characters to search.
								</TextComponent>
							) : null}
						</View>

						{/* Document Title Section */}
						<View className="mb-5">
							<TextComponent className="text-sm font-bold text-foreground mb-2">
								Document Title <TextComponent className="text-destructive">*</TextComponent>
							</TextComponent>
							<Controller
								control={control}
								name="title"
								rules={{ required: 'Document title is required' }}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										className={`rounded-xl border bg-background px-4 py-3.5 text-base text-foreground ${
											errors.title ? 'border-destructive' : 'border-border/60'
										}`}
										placeholder="e.g. Final Year Thesis"
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
						<View className="mb-5">
							<TextComponent className="text-sm font-bold text-foreground mb-2">
								Description <TextComponent className="text-muted-foreground text-xs font-semibold">(Optional)</TextComponent>
							</TextComponent>
							<Controller
								control={control}
								name="description"
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										className="min-h-[100px] rounded-xl border border-border/60 bg-background px-4 py-3.5 text-base text-foreground"
										placeholder="Any specific descriptions..."
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

						{/* Documents Upload Section */}
						<View className="mb-2">
							<TextComponent className="text-sm font-bold text-foreground mb-2">
								Documents <TextComponent className="text-destructive">*</TextComponent>
							</TextComponent>

							{files.length === 0 ? (
								<Pressable
									className={`items-center rounded-xl border-2 border-dashed px-5 py-8 active:opacity-95 ${
										errors.files ? 'border-destructive' : 'border-border/60'
									}`}
									style={({ pressed }) => ({
										backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(68, 78, 187, 0.05)',
										transform: [{ scale: pressed ? 0.98 : 1 }]
									})}
									onPress={handleSelectFile}>
									<View
										className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
										<UploadIcon
											size={22}
											color={colors.primary}
										/>
									</View>
									<TextComponent className="text-sm font-bold text-foreground">
										Click to upload or drag and drop
									</TextComponent>
									<TextComponent 
										className="mt-1 text-center text-xs leading-5 text-foreground font-semibold"
										style={{ opacity: 0.5 }}>
										PDF, Word, or image files. Add up to {MAX_SELECTED_FILES} files.
									</TextComponent>
								</Pressable>
							) : (
								<View>
									{/* Uploaded File rows */}
									{files.map((file, index) => (
										<View
											key={`${file.uri}-${index}`}
											className="mb-3 rounded-2xl border border-border bg-background px-4 py-3.5 shadow-sm">
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
													<TextComponent className="mt-0.5 text-xs text-muted-foreground font-semibold">
														{getFileTypeLabel(file.mimeType)} • {formatFileSize(file.size)}
														{file.pageCount !== undefined
															? ` • ${file.pageCount} pages`
															: ''}
													</TextComponent>
												</View>

												<Pressable
													onPress={() => handleRemoveFile(index)}
													className="ml-3 h-9 w-9 items-center justify-center rounded-xl active:scale-95"
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

									{/* Add another file helper button */}
									<Pressable
										onPress={handleSelectFile}
										className="mt-2 min-h-[48px] flex-row items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 active:opacity-95"
										style={({ pressed }) => ({
											transform: [{ scale: pressed ? 0.98 : 1 }]
										})}>
										<PlusIcon
											size={14}
											color={colors.primary}
										/>
										<TextComponent className="ml-2 text-xs font-bold uppercase tracking-[0.8px] text-primary">
											Add another file
										</TextComponent>
									</Pressable>
								</View>
							)}

							{errors.files ? (
								<TextComponent className="mt-1.5 text-xs text-destructive px-1">
									Please select at least one file
								</TextComponent>
							) : null}
						</View>
					</View>

					{/* Action Buttons Section */}
					<View>
						<Pressable
							className="min-h-[50px] flex-row items-center justify-center rounded-xl bg-primary active:opacity-90 shadow-sm"
							style={({ pressed }) => ({
								transform: [{ scale: pressed ? 0.98 : 1 }]
							})}
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
									Submit Project
								</TextComponent>
							)}
						</Pressable>

						<Pressable
							className="mt-3 min-h-[44px] items-center justify-center rounded-xl border border-border bg-card active:opacity-90"
							style={({ pressed }) => ({
								transform: [{ scale: pressed ? 0.98 : 1 }]
							})}
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
