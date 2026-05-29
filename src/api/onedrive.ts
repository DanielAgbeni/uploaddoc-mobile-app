import api from './index';

// Types for OneDrive API responses
export interface OneDriveStatusResponse {
	success: boolean;
	data: {
		connected: boolean;
		driveEmail: string | null;
		tier: number; // 1=Basic, 2=Standard, 3=Professional, 4=Enterprise
		tierName?: string; // Optional, might be added by backend helper or inferred
		canUseDriveSync: boolean;
		autoSync: boolean;
		canAutoSync: boolean;
		dailySyncLimit: number;
		dailySyncsUsed?: number;
		syncsToday?: number;
		remainingSyncs?: number | 'Unlimited';
	};
}

export interface OneDriveConnectResponse {
	success: boolean;
	authUrl: string;
}

export interface OneDriveDisconnectResponse {
	success: boolean;
	message: string;
}

export interface OneDriveAutoSyncResponse {
	success: boolean;
	autoSync: boolean;
	message: string;
}

export interface OneDriveSyncResponse {
	success: boolean;
	message: string;
	driveUrl?: string;
}

// API Functions

/**
 * Get OneDrive connection status and tier eligibility
 */
export const getOneDriveStatus = async () => {
	const response = await api.get<OneDriveStatusResponse>(
		'/api/onedrive/status',
	);
	// Map tier number to name if needed, or rely on backend
	return response.data;
};

/**
 * Start OAuth flow to connect OneDrive
 * Returns authUrl to redirect user to
 */
export const connectOneDrive = async () => {
	const response = await api.get<OneDriveConnectResponse>(
		'/api/onedrive/connect?mobile=true',
	);
	return response.data;
};

/**
 * Disconnect OneDrive and revoke tokens
 */
export const disconnectOneDrive = async () => {
	const response = await api.post<OneDriveDisconnectResponse>(
		'/api/onedrive/disconnect',
	);
	return response.data;
};

/**
 * Toggle auto-sync setting
 */
export const toggleOneDriveAutoSync = async (enabled: boolean) => {
	const response = await api.post<OneDriveAutoSyncResponse>(
		'/api/onedrive/auto-sync',
		{ enabled },
	);
	return response.data;
};

/**
 * Sync a specific project to OneDrive
 */
export const syncProjectToOneDrive = async (projectId: string) => {
	const response = await api.post<OneDriveSyncResponse>(
		`/api/onedrive/sync/${projectId}`,
	);
	return response.data;
};
