import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage keys
 */
export const SECURE_STORAGE_KEYS = {
	ACCESS_TOKEN: 'access_token',
	REFRESH_TOKEN: 'refresh_token',
} as const;

/**
 * Save a value securely
 */
export async function saveSecure(key: string, value: string): Promise<void> {
	try {
		await SecureStore.setItemAsync(key, value);
	} catch (error) {
		console.error(`Error saving ${key} to secure storage:`, error);
		throw error;
	}
}

/**
 * Get a value from secure storage
 */
export async function getSecure(key: string): Promise<string | null> {
	try {
		return await SecureStore.getItemAsync(key);
	} catch (error) {
		console.error(`Error getting ${key} from secure storage:`, error);
		return null;
	}
}

/**
 * Delete a value from secure storage
 */
export async function deleteSecure(key: string): Promise<void> {
	try {
		await SecureStore.deleteItemAsync(key);
	} catch (error) {
		console.error(`Error deleting ${key} from secure storage:`, error);
		throw error;
	}
}

/**
 * Save auth tokens securely
 */
export async function saveAuthTokens(
	accessToken: string,
	refreshToken: string,
): Promise<void> {
	await Promise.all([
		saveSecure(SECURE_STORAGE_KEYS.ACCESS_TOKEN, accessToken),
		saveSecure(SECURE_STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
	]);
}

/**
 * Get auth tokens from secure storage
 */
export async function getAuthTokens(): Promise<{
	accessToken: string | null;
	refreshToken: string | null;
}> {
	const [accessToken, refreshToken] = await Promise.all([
		getSecure(SECURE_STORAGE_KEYS.ACCESS_TOKEN),
		getSecure(SECURE_STORAGE_KEYS.REFRESH_TOKEN),
	]);

	return { accessToken, refreshToken };
}

/**
 * Clear all auth tokens
 */
export async function clearAuthTokens(): Promise<void> {
	await Promise.all([
		deleteSecure(SECURE_STORAGE_KEYS.ACCESS_TOKEN),
		deleteSecure(SECURE_STORAGE_KEYS.REFRESH_TOKEN),
	]);
}
