import { getDropboxStatus, DropboxStatusResponse } from './dropbox';
import { getDriveStatus, DriveStatusResponse } from './googledrive';
import { getOneDriveStatus, OneDriveStatusResponse } from './onedrive';

// Types (You might want to move these to your types file)
export type CloudProvider = 'google-drive' | 'dropbox' | 'onedrive';

export interface CloudStatus {
	providerName: CloudProvider;
	status: {
		connected: boolean;
		driveEmail: string | null;
		connectedAt: string | null;
		canAutoSync: boolean;
		autoSync: boolean;
	};
}

export interface CloudSyncResponse {
	google: DriveStatusResponse['data'] | undefined;
	onedrive: OneDriveStatusResponse['data'] | undefined;
	dropbox: DropboxStatusResponse['data'] | undefined;
}

export const getAllCloudStatus = async (): Promise<CloudSyncResponse> => {
	const [googleRes, oneDriveRes, dropboxRes] = await Promise.allSettled([
		getDriveStatus(),
		getOneDriveStatus(),
		getDropboxStatus(),
	]);

	return {
		google:
			googleRes.status === 'fulfilled' ? googleRes.value?.data : undefined,
		onedrive:
			oneDriveRes.status === 'fulfilled' ? oneDriveRes.value?.data : undefined,
		dropbox:
			dropboxRes.status === 'fulfilled' ? dropboxRes.value?.data : undefined,
	};
};

export const getActiveProvider = (
	data: CloudSyncResponse | undefined,
): CloudStatus | null => {
	if (!data) return null;

	// Logic to find the first connected provider or the preferred one
	// Prioritize Google Drive, then OneDrive, then Dropbox

	if (data.google?.connected) {
		return {
			providerName: 'google-drive',
			status: {
				connected: true,
				driveEmail: data.google.driveEmail,
				connectedAt: data.google.connectedAt,
				canAutoSync: data.google.canAutoSync,
				autoSync: data.google.autoSync,
			},
		};
	}

	if (data.onedrive?.connected) {
		return {
			providerName: 'onedrive',
			status: {
				connected: true,
				driveEmail: data.onedrive.driveEmail,
				connectedAt: null, // OneDrive status might not have this, check interface
				canAutoSync: data.onedrive.canAutoSync,
				autoSync: data.onedrive.autoSync,
			},
		};
	}

	if (data.dropbox?.connected) {
		return {
			providerName: 'dropbox',
			status: {
				connected: true,
				driveEmail: data.dropbox.driveEmail,
				connectedAt: null, // Dropbox status might not have this
				canAutoSync: data.dropbox.canAutoSync,
				autoSync: data.dropbox.autoSync,
			},
		};
	}

	return null;
};

export const getCloudSyncEligibility = (
	data: CloudSyncResponse | undefined,
) => {
	// Consolidate eligibility from any provider or default to false
	// Assuming if any provider returns data, we can derive global eligibility or check specific provider
	// The original code expected a global 'eligibility' object.
	// We might need to derive this from one of the providers or just return a default if the backend logic for global eligibility is not exposed here.
	// For now, let's use Google's eligibility as the primary source or fallback to others if available.

	const canUseDriveSync =
		data?.google?.canUseDriveSync ||
		data?.onedrive?.canUseDriveSync ||
		data?.dropbox?.canUseDriveSync ||
		false;

	return { canUseDriveSync };
};
