import { MMKV } from "react-native-mmkv";
import { ColorSchemeName } from "react-native";
import {
  DEFAULT_STORAGE_ENCRYPTION_KEY,
  USER_AUTH_STORAGE_ID,
} from "./variables";

type TUserDetails = UserDetailsType; 

const USER_AUTH_STORAGE_KEY = process.env.USER_AUTH_STORAGE_KEY;


const USER_TOKEN_STORE_KEY = "USER_TOKEN_STORE_KEY",
  USER_REFRESH_TOKEN_KEY = "USER_REFRESH_TOKEN_KEY",
  USER_DETAILS_STORE = "USER_DETAILS_STORE",
  USER_THEME_STORE_KEY = "USER_THEME_STORE_KEY";

const userTokenStorage = new MMKV({
  id: USER_AUTH_STORAGE_ID,
  encryptionKey: USER_AUTH_STORAGE_KEY || DEFAULT_STORAGE_ENCRYPTION_KEY, 
});

const storeUserToken = (token: string) => {
  userTokenStorage.set(USER_TOKEN_STORE_KEY, token);
};

const storeRefreshToken = (token: string) => {
  userTokenStorage.set(USER_REFRESH_TOKEN_KEY, token);
};

const saveThemeMode = (themeMode: ColorSchemeName) => {
  if (!themeMode || typeof themeMode !== "string") {
    return;
  }
  userTokenStorage.set(USER_THEME_STORE_KEY, themeMode);
};

const getThemeMode = () => {
  return userTokenStorage.getString(USER_THEME_STORE_KEY) as ColorSchemeName;
};

const getUserToken = () => {
  return userTokenStorage.getString(USER_TOKEN_STORE_KEY);
};

const getRefreshToken = () => {
  return userTokenStorage.getString(USER_REFRESH_TOKEN_KEY);
};

const storeUserDetails = (userDetails: TUserDetails) => {
  const stringifiedData = JSON.stringify(userDetails);
  userTokenStorage.set(USER_DETAILS_STORE, stringifiedData);
};

const getStoredUserDetails = () => {
  const storedDetails = userTokenStorage.getString(USER_DETAILS_STORE);

  if (!storedDetails) {
    return undefined;
  }
  return JSON.parse(storedDetails) as TUserDetails;
};

const deleteUserDetails = () => {
  return userTokenStorage.delete(USER_DETAILS_STORE);
};

const deleteUserToken = () => {
  return userTokenStorage.delete(USER_TOKEN_STORE_KEY);
};

const deleteRefreshToken = () => {
  return userTokenStorage.delete(USER_REFRESH_TOKEN_KEY);
};

export const saveAuthNeededDetails = (token: string, refreshToken: string, userDetails: TUserDetails) => {
  storeUserToken(token);
  storeRefreshToken(refreshToken);
  storeUserDetails(userDetails);
};

export const getAppNeededDetails = () => {
  const userToken = getUserToken();
  const refreshToken = getRefreshToken();
  const userDetails = getStoredUserDetails();
  const themeMode = getThemeMode();

  return { userToken, refreshToken, userDetails, themeMode };
};

export const deleteAuthNeededDetails = () => {
  deleteUserDetails();
  deleteUserToken();
  deleteRefreshToken();

  return;
};

export {
  saveThemeMode,
};

export default userTokenStorage;
