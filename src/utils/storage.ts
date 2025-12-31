import { MMKV } from 'react-native-mmkv';
import { ColorSchemeName } from 'react-native';
import {
	DEFAULT_STORAGE_ENCRYPTION_KEY,
	USER_AUTH_STORAGE_ID,
} from './variables';
import {
	saveAuthTokens,
	getAuthTokens,
	clearAuthTokens,
} from './secureStorage';

type TUserDetails = UserDetailsType;

const USER_AUTH_STORAGE_KEY = process.env.USER_AUTH_STORAGE_KEY;

const USER_DETAILS_STORE = 'USER_DETAILS_STORE',
	USER_THEME_STORE_KEY = 'USER_THEME_STORE_KEY';

// MMKV for non-sensitive data (user details, theme, etc.)
export const storage = new MMKV({
	id: USER_AUTH_STORAGE_ID,
	encryptionKey: USER_AUTH_STORAGE_KEY || DEFAULT_STORAGE_ENCRYPTION_KEY,
});

// Legacy MMKV storage for backward compatibility with Zustand
const userTokenStorage = storage;

const saveThemeMode = (themeMode: ColorSchemeName) => {
	if (!themeMode || typeof themeMode !== 'string') {
		return;
	}
	storage.set(USER_THEME_STORE_KEY, themeMode);
};

const getThemeMode = () => {
	return storage.getString(USER_THEME_STORE_KEY) as ColorSchemeName;
};

const storeUserDetails = (userDetails: TUserDetails) => {
	const stringifiedData = JSON.stringify(userDetails);
	storage.set(USER_DETAILS_STORE, stringifiedData);
};

const getStoredUserDetails = () => {
	const storedDetails = storage.getString(USER_DETAILS_STORE);

	if (!storedDetails) {
		return undefined;
	}
	return JSON.parse(storedDetails) as TUserDetails;
};

const deleteUserDetails = () => {
	return storage.delete(USER_DETAILS_STORE);
};

/**
 * Save authentication details
 * - Tokens are stored in secure storage (expo-secure-store)
 * - User details are stored in MMKV
 */
export const saveAuthNeededDetails = async (
	token: string,
	refreshToken: string,
	userDetails: TUserDetails,
) => {
	// Store tokens securely using expo-secure-store
	await saveAuthTokens(token, refreshToken);
	// Store user details in MMKV (non-sensitive)
	storeUserDetails(userDetails);
};

/**
 * Get all authentication details
 * Returns tokens from secure storage and user details from MMKV
 */
export const getAppNeededDetails = async () => {
	const { accessToken: userToken, refreshToken } = await getAuthTokens();
	const userDetails = getStoredUserDetails();
	const themeMode = getThemeMode();

	return { userToken, refreshToken, userDetails, themeMode };
};

/**
 * Delete all authentication details
 * Clears tokens from secure storage and user details from MMKV
 */
export const deleteAuthNeededDetails = async () => {
	await clearAuthTokens();
	deleteUserDetails();
};

export { saveThemeMode };

export default userTokenStorage;
