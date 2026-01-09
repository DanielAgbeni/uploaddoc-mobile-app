import api from './index';

// Types for Dropbox API responses
export interface DropboxStatusResponse {
	success: boolean;
	data: {
		connected: boolean;
		driveEmail: string | null;
		tier: number; // 1=Basic, 2=Standard, 3=Professional, 4=Enterprise
		tierName?: string;
		canUseDriveSync: boolean;
		autoSync: boolean;
		canAutoSync: boolean;
		dailySyncLimit: number;
		dailySyncsUsed?: number;
	};
}

export interface DropboxConnectResponse {
	success: boolean;
	authUrl: string;
}

export interface DropboxDisconnectResponse {
	success: boolean;
	message: string;
}

export interface DropboxAutoSyncResponse {
	success: boolean;
	autoSync: boolean;
	message: string;
}

export interface DropboxSyncResponse {
	success: boolean;
	message: string;
	driveUrl?: string;
}

// API Functions

/**
 * Get Dropbox connection status and tier eligibility
 */
export const getDropboxStatus = async () => {
	const response = await api.get<DropboxStatusResponse>('/api/dropbox/status');
	return response.data;
};

/**
 * Start OAuth flow to connect Dropbox
 * Returns authUrl to redirect user to
 */
export const connectDropbox = async () => {
	const response = await api.get<DropboxConnectResponse>(
		'/api/dropbox/connect',
	);
	return response.data;
};

/**
 * Disconnect Dropbox and revoke tokens
 */
export const disconnectDropbox = async () => {
	const response = await api.post<DropboxDisconnectResponse>(
		'/api/dropbox/disconnect',
	);
	return response.data;
};

/**
 * Toggle auto-sync setting
 */
export const toggleDropboxAutoSync = async (enabled: boolean) => {
	const response = await api.post<DropboxAutoSyncResponse>(
		'/api/dropbox/auto-sync',
		{ enabled },
	);
	return response.data;
};

/**
 * Sync a specific project to Dropbox
 */
export const syncProjectToDropbox = async (projectId: string) => {
	const response = await api.post<DropboxSyncResponse>(
		`/api/dropbox/sync/${projectId}`,
	);
	return response.data;
};
