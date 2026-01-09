import api from './index';

// Types for Google Drive API responses
export interface DriveStatusResponse {
  success: boolean;
  data: {
    canUseDriveSync: boolean;
    tier: number;
    tierName: string;
    connected: boolean;
    driveEmail: string | null;
    connectedAt: string | null;
    autoSync: boolean;
    canAutoSync: boolean;
    dailySyncLimit: number;
    dailySyncsUsed?: number;
  };
}

export interface DriveConnectResponse {
  success: boolean;
  authUrl: string;
  message: string;
}

export interface DriveDisconnectResponse {
  success: boolean;
  message: string;
}

export interface DriveAutoSyncResponse {
  success: boolean;
  autoSync: boolean;
  message: string;
}

export interface DriveSyncResponse {
  success: boolean;
  message: string;
  driveUrl?: string;
}

export interface DriveSyncAllResponse {
  success: boolean;
  message: string;
  synced: number;
  failed: number;
  remaining: number;
  results: Array<{
    projectId: string;
    title: string;
    success: boolean;
    error?: string;
  }>;
}

// API Functions

/**
 * Get Google Drive connection status and tier eligibility
 */
export const getDriveStatus = async () => {
  const response = await api.get<DriveStatusResponse>('/api/googledrive/status');
  return response.data;
};

/**
 * Start OAuth flow to connect Google Drive
 * Returns authUrl to redirect user to
 */
export const connectDrive = async () => {
  const response = await api.get<DriveConnectResponse>('/api/googledrive/connect');
  return response.data;
};

/**
 * Disconnect Google Drive and revoke tokens
 */
export const disconnectDrive = async () => {
  const response = await api.post<DriveDisconnectResponse>('/api/googledrive/disconnect');
  return response.data;
};

/**
 * Toggle auto-sync setting (Professional+ tiers only)
 */
export const toggleAutoSync = async (enabled: boolean) => {
  const response = await api.post<DriveAutoSyncResponse>('/api/googledrive/auto-sync', { enabled });
  return response.data;
};

/**
 * Sync a single accepted project to Google Drive
 */
export const syncProject = async (projectId: string) => {
  const response = await api.post<DriveSyncResponse>(`/api/googledrive/sync/${projectId}`);
  return response.data;
};

/**
 * Sync all accepted, unsynced projects to Google Drive
 * Respects daily limits based on tier
 */
export const syncAllProjects = async () => {
  const response = await api.post<DriveSyncAllResponse>('/api/googledrive/sync-all');
  return response.data;
};
