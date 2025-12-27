import { postData, getData } from '.';

const EMAIL_API_BASE_URL = 'https://upload-doc-backend.vercel.app';

export const registerUser = async (data: RegisterPayloadType) => {
	return postData<RegisterPayloadType, RegisterResponseType>(
		'/api/auth/register',
		data,
		{ baseURL: EMAIL_API_BASE_URL }
	);
};

export const loginUser = async (data: LoginPayloadType) => {
	return postData<LoginPayloadType, LoginResponseType>(
		'/api/auth/login',
		data
	);
};

export const verifyEmail = async (data: VerifyEmailPayloadType) => {
	return postData<VerifyEmailPayloadType, VerifyEmailResponseType>(
		'/api/auth/verify-email',
		data
	);
};

export const resendVerificationCode = async (email: string) => {
	return postData<{ email: string }, { success: boolean; message: string }>(
		'/api/auth/resend-verification',
		{ email },
		{ baseURL: EMAIL_API_BASE_URL }
	);
};
export const forgetpassword = async (email: string) => {
	return postData<{ email: string }, { success: boolean; message: string }>(
		'/api/auth/forgot-password',
		{ email },
		{ baseURL: EMAIL_API_BASE_URL }
	);
};


export const resetPassword = async (data: ResetPasswordPayloadType) => {
	return postData<ResetPasswordPayloadType, { success: boolean; message: string }>(
		'/api/auth/reset-password',
		data,
		{ baseURL: EMAIL_API_BASE_URL }
	);
};

export const refreshUserToken = async (refreshToken: string) => {
	return postData<{ refreshToken: string }, LoginResponseType>(
		'/api/auth/refresh-token',
		{ refreshToken }
	);
};

export const getUserStatus = async () => {
    return getData<UserStatusResponse>('/api/auth/status');
};

export const googleLogin = async (idToken: string) => {
    return postData<{ idToken: string }, LoginResponseType>(
        '/api/auth/google/login',
        { idToken }
    );
};

export const getUserBySlug = async (slug: string) => {
    return getData<{ _id: string; name: string; email: string; profilePicture?: string; printingLocation?: string; printingCost?: number; openingHours?: string; rating?: number; adminStatus?: string }>(
        `/api/users/slug/${encodeURIComponent(slug)}`
    );
};
