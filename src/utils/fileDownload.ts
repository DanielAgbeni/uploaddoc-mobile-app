import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Download directory name
const DOWNLOAD_FOLDER_NAME = 'UploadDoc';

// Storage Access Framework for Android public storage
const { StorageAccessFramework } = FileSystem;

/**
 * Get the base download directory path (private app storage - fallback)
 */
const getPrivateDownloadDirectory = (): string => {
	return `${FileSystem.documentDirectory}${DOWNLOAD_FOLDER_NAME}`;
};

/**
 * Extract file extension from MIME type or filename
 */
const getFileExtension = (fileType: string, fileUrl: string): string => {
	// First, try to extract from URL
	const urlParts = fileUrl.split('/');
	const filename = urlParts[urlParts.length - 1];
	const urlExtMatch = filename.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
	if (urlExtMatch) {
		return urlExtMatch[1].toLowerCase();
	}

	// Fallback to MIME type mapping
	const mimeToExt: Record<string, string> = {
		'application/pdf': 'pdf',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
			'docx',
		'application/msword': 'doc',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
		'application/vnd.ms-excel': 'xls',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation':
			'pptx',
		'application/vnd.ms-powerpoint': 'ppt',
		'image/jpeg': 'jpg',
		'image/png': 'png',
		'image/gif': 'gif',
		'image/webp': 'webp',
		'text/plain': 'txt',
		'text/csv': 'csv',
	};

	return mimeToExt[fileType] || 'file';
};

/**
 * Get MIME type from file type string
 */
const getMimeType = (fileType: string): string => {
	// If it's already a valid MIME type, return it
	if (fileType.includes('/')) {
		return fileType;
	}

	// Extension to MIME type mapping
	const extToMime: Record<string, string> = {
		pdf: 'application/pdf',
		docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		doc: 'application/msword',
		xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		xls: 'application/vnd.ms-excel',
		pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		ppt: 'application/vnd.ms-powerpoint',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		gif: 'image/gif',
		webp: 'image/webp',
		txt: 'text/plain',
		csv: 'text/csv',
	};

	return extToMime[fileType.toLowerCase()] || 'application/octet-stream';
};

/**
 * Sanitize filename to remove invalid characters
 */
const sanitizeFilename = (filename: string): string => {
	// Remove or replace invalid filename characters
	return filename
		.replace(/[<>:"/\\|?*]/g, '_')
		.replace(/\s+/g, '_')
		.trim();
};

/**
 * Ensure the private download directory exists (fallback)
 */
export const ensurePrivateDownloadDirectory = async (): Promise<string> => {
	const downloadDir = getPrivateDownloadDirectory();

	console.log(
		'[FileDownload] Checking private download directory:',
		downloadDir,
	);

	const dirInfo = await FileSystem.getInfoAsync(downloadDir);

	if (!dirInfo.exists) {
		console.log('[FileDownload] Creating private download directory...');
		await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
		console.log(
			'[FileDownload] Private download directory created successfully',
		);
	}

	return downloadDir;
};

export type DownloadResult = {
	success: boolean;
	filePath?: string;
	error?: string;
	isPublic?: boolean;
};

export type DownloadProgress = {
	totalBytesWritten: number;
	totalBytesExpectedToWrite: number;
	progress: number;
};

export type DownloadOptions = {
	onProgress?: (progress: DownloadProgress) => void;
};

/**
 * Request permission to save to Downloads folder (Android)
 */
const requestDownloadsFolderPermission = async (): Promise<string | null> => {
	if (Platform.OS !== 'android') {
		return null;
	}

	try {
		console.log('[FileDownload] Requesting Downloads folder permission...');

		const permissions =
			await StorageAccessFramework.requestDirectoryPermissionsAsync();

		if (permissions.granted) {
			console.log(
				'[FileDownload] Permission granted. Directory URI:',
				permissions.directoryUri,
			);
			return permissions.directoryUri;
		} else {
			console.log('[FileDownload] Permission denied by user');
			return null;
		}
	} catch (error) {
		console.error('[FileDownload] Error requesting permissions:', error);
		return null;
	}
};

/**
 * Save file to public Downloads folder using Storage Access Framework
 */
const saveToPublicDownloads = async (
	tempFilePath: string,
	filename: string,
	mimeType: string,
	directoryUri: string,
): Promise<string | null> => {
	try {
		console.log('[FileDownload] Creating file in public Downloads...');
		console.log('[FileDownload] Directory URI:', directoryUri);
		console.log('[FileDownload] Filename:', filename);
		console.log('[FileDownload] MIME Type:', mimeType);

		// Create the file in the selected directory
		const newFileUri = await StorageAccessFramework.createFileAsync(
			directoryUri,
			filename,
			mimeType,
		);

		console.log('[FileDownload] New file URI:', newFileUri);

		// Read the temp file content
		const fileContent = await FileSystem.readAsStringAsync(tempFilePath, {
			encoding: FileSystem.EncodingType.Base64,
		});

		// Write content to the new file
		await FileSystem.writeAsStringAsync(newFileUri, fileContent, {
			encoding: FileSystem.EncodingType.Base64,
		});

		console.log('[FileDownload] File saved to public Downloads successfully!');
		return newFileUri;
	} catch (error) {
		console.error('[FileDownload] Error saving to public Downloads:', error);
		return null;
	}
};

/**
 * Download a document to the public Downloads folder (Android) or app storage (iOS)
 * On Android, this will prompt the user to select the Downloads folder on first use
 */
export const downloadDocument = async (
	fileUrl: string,
	title: string,
	fileType: string,
	options?: DownloadOptions,
): Promise<DownloadResult> => {
	console.log('[FileDownload] ========================================');
	console.log('[FileDownload] Starting download...');
	console.log('[FileDownload] URL:', fileUrl);
	console.log('[FileDownload] Title:', title);
	console.log('[FileDownload] File Type:', fileType);
	console.log('[FileDownload] Platform:', Platform.OS);

	try {
		// Generate filename
		const extension = getFileExtension(fileType, fileUrl);
		const sanitizedTitle = sanitizeFilename(title);
		const timestamp = Date.now();
		const filename = `${sanitizedTitle}_${timestamp}.${extension}`;
		const mimeType = getMimeType(fileType);

		console.log('[FileDownload] Generated filename:', filename);
		console.log('[FileDownload] MIME type:', mimeType);

		// Step 1: Download to cache directory first (temporary location)
		const tempFilePath = `${FileSystem.cacheDirectory}${filename}`;
		console.log('[FileDownload] Downloading to temp location:', tempFilePath);

		const downloadResumable = FileSystem.createDownloadResumable(
			fileUrl,
			tempFilePath,
			{},
			(downloadProgress) => {
				const progress =
					downloadProgress.totalBytesWritten /
					downloadProgress.totalBytesExpectedToWrite;

				console.log(
					`[FileDownload] Progress: ${Math.round(progress * 100)}% (${downloadProgress.totalBytesWritten}/${downloadProgress.totalBytesExpectedToWrite} bytes)`,
				);

				if (options?.onProgress) {
					options.onProgress({
						...downloadProgress,
						progress,
					});
				}
			},
		);

		const downloadResult = await downloadResumable.downloadAsync();

		if (!downloadResult?.uri) {
			throw new Error('Download failed - no URI returned');
		}

		console.log(
			'[FileDownload] Downloaded to temp location:',
			downloadResult.uri,
		);

		// Step 2: Try to save to public Downloads folder (Android only)
		if (Platform.OS === 'android') {
			console.log(
				'[FileDownload] Android detected - will save to public Downloads folder',
			);

			// Request permission to save to Downloads
			const directoryUri = await requestDownloadsFolderPermission();

			if (directoryUri) {
				const publicFilePath = await saveToPublicDownloads(
					downloadResult.uri,
					filename,
					mimeType,
					directoryUri,
				);

				if (publicFilePath) {
					// Clean up temp file
					await FileSystem.deleteAsync(downloadResult.uri, {
						idempotent: true,
					});

					console.log(
						'[FileDownload] File saved to public Downloads:',
						publicFilePath,
					);
					console.log(
						'[FileDownload] ========================================',
					);

					return {
						success: true,
						filePath: publicFilePath,
						isPublic: true,
					};
				}
			}

			// Fallback: If user cancelled or error occurred, save to private storage
			console.log('[FileDownload] Falling back to private storage...');
		}

		// For iOS or Android fallback: Move to private app storage
		const privateDir = await ensurePrivateDownloadDirectory();
		const privateFilePath = `${privateDir}/${filename}`;

		await FileSystem.moveAsync({
			from: downloadResult.uri,
			to: privateFilePath,
		});

		console.log(
			'[FileDownload] File saved to private storage:',
			privateFilePath,
		);
		console.log('[FileDownload] ========================================');

		return {
			success: true,
			filePath: privateFilePath,
			isPublic: false,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error occurred';

		console.error('[FileDownload] Download failed:', errorMessage);
		console.error('[FileDownload] ========================================');

		return {
			success: false,
			error: errorMessage,
		};
	}
};

/**
 * Check if a file exists in the private download directory
 */
export const checkFileExists = async (filename: string): Promise<boolean> => {
	const downloadDir = getPrivateDownloadDirectory();
	const filePath = `${downloadDir}/${filename}`;
	const fileInfo = await FileSystem.getInfoAsync(filePath);
	return fileInfo.exists;
};

/**
 * List all downloaded files in private storage
 */
export const listDownloadedFiles = async (): Promise<string[]> => {
	try {
		const downloadDir = getPrivateDownloadDirectory();
		const dirInfo = await FileSystem.getInfoAsync(downloadDir);

		if (!dirInfo.exists) {
			return [];
		}

		const files = await FileSystem.readDirectoryAsync(downloadDir);
		console.log('[FileDownload] Downloaded files:', files);
		return files;
	} catch (error) {
		console.error('[FileDownload] Error listing files:', error);
		return [];
	}
};

/**
 * Delete a downloaded file from private storage
 */
export const deleteDownloadedFile = async (
	filename: string,
): Promise<boolean> => {
	try {
		const downloadDir = getPrivateDownloadDirectory();
		const filePath = `${downloadDir}/${filename}`;
		await FileSystem.deleteAsync(filePath);
		console.log('[FileDownload] File deleted:', filename);
		return true;
	} catch (error) {
		console.error('[FileDownload] Error deleting file:', error);
		return false;
	}
};

/**
 * Get the download folder path for display purposes
 */
export const getDownloadFolderPath = (): string => {
	if (Platform.OS === 'android') {
		return 'Downloads folder (select when prompted)';
	}
	return getPrivateDownloadDirectory();
};
