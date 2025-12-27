import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import userTokenStorage, { deleteAuthNeededDetails, saveAuthNeededDetails } from '../../utils/storage';
import { setHeaderAuthorization } from '../../api';

type UserStore = {
	user: UserDetailsType | null;
	token: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	setLoginData: (data: LoginResponseDataType) => void;
	setUserDetails: (user: UserDetailsType) => void;
	logout: () => void;
	clearStore: () => void;
	hasHydrated: boolean;
};

export const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			refreshToken: null,
			isAuthenticated: false,
			hasHydrated: false,
			setLoginData: (data) => {
				saveAuthNeededDetails(data.token, data.refreshToken, data.user);
				set({
					user: data.user,
					token: data.token,
					refreshToken: data.refreshToken,
					isAuthenticated: true,
				});
			},
			setUserDetails: (user) => {
				set({ user });
			},
			logout: () => {
				deleteAuthNeededDetails();
				set({
					user: null,
					token: null,
					refreshToken: null,
					isAuthenticated: false,
				});
			},
			clearStore: () => {
				deleteAuthNeededDetails();
				set({
					user: null,
					token: null,
					refreshToken: null,
					isAuthenticated: false,
				});
			},
		}),
		{
			name: 'upload-doc-storage',
			storage: createJSONStorage(() => ({
				setItem: (name, value) => userTokenStorage.set(name, value),
				getItem: (name) => userTokenStorage.getString(name) ?? null,
				removeItem: (name) => userTokenStorage.delete(name),
			})),
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.hasHydrated = true;
				}
				if (state?.token) {
					setHeaderAuthorization(state.token);
				}
			},
		}
	)
);

export default useUserStore;
