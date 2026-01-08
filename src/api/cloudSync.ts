import api, { getData } from './index';

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
	success: boolean;
	data: {
		providers: Record<CloudProvider, CloudStatus['status']>;
		eligibility: {
			canUseDriveSync: boolean;
		};
	};
}

export const getAllCloudStatus = async () => {
	return getData<CloudSyncResponse>('/api/cloud-sync/status');
};

export const getActiveProvider = (
	data: CloudSyncResponse | undefined,
): CloudStatus | null => {
	if (!data?.data?.providers) return null;

	// Logic to find the first connected provider or the preferred one
	// For now, let's prioritize Google Drive, then others
	const providers: CloudProvider[] = ['google-drive', 'onedrive', 'dropbox'];

	for (const provider of providers) {
		const status = data.data.providers[provider];
		if (status?.connected) {
			return {
				providerName: provider,
				status,
			};
		}
	}

	return null;
};

export const getCloudSyncEligibility = (
	data: CloudSyncResponse | undefined,
) => {
	return data?.data?.eligibility || { canUseDriveSync: false };
};
