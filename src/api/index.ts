import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAppNeededDetails } from '../utils/storage';

type ApiRequestResponseType<T> = Promise<AxiosResponse<T>>;

const controller = new AbortController();

const baseURL = 'https://uploaddoc-backend.onrender.com';

console.log('Base URL: ', baseURL);

const api = axios.create({
	baseURL,
	signal: controller.signal,
});

api.interceptors.request.use(async (config) => {
	const { userToken } = await getAppNeededDetails();
	if (userToken) {
		config.headers.Authorization = `Bearer ${userToken}`;
	}
	return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});

	failedQueue = [];
};

api.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise(function (resolve, reject) {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers['Authorization'] = 'Bearer ' + token;
						return api(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const { refreshToken } = await getAppNeededDetails();

			if (!refreshToken) {
				isRefreshing = false;
				return Promise.reject(error);
			}

			try {
				// Circular dependency avoidance: Call endpoint directly
				const response = await api.post('/api/auth/refresh-token', {
					refreshToken,
				});

				const { token } = response.data.data;

				// Update Store and Storage
				const { useUserStore } =
					await import('../shared/user-store/useUserStore');
				useUserStore.getState().setLoginData(response.data.data);

				setHeaderAuthorization(token);

				processQueue(null, token);
				isRefreshing = false;

				originalRequest.headers['Authorization'] = 'Bearer ' + token;
				return api(originalRequest);
			} catch (err) {
				processQueue(err, null);
				isRefreshing = false;

				const { useUserStore } =
					await import('../shared/user-store/useUserStore');
				useUserStore.getState().logout();
				return Promise.reject(err);
			}
		}

		return Promise.reject(error);
	},
);

export const setHeaderAuthorization: (token?: string) => void = (token) => {
	if (token) {
		api.defaults.headers.common.Authorization = `Bearer ${token}`;
	} else {
		api.defaults.headers.common.Authorization = undefined;
	}
};

export const postData = <T, D>(
	url: string,
	data?: T | undefined,
	options?: AxiosRequestConfig,
): ApiRequestResponseType<D> => {
	return api.post(url, data, options);
};

export const getData = <T>(
	url: string,
	options?: AxiosRequestConfig,
): ApiRequestResponseType<T> => {
	return api.get(url, options);
};

export const putData = <T, D>(
	url: string,
	data: T | undefined,
	options?: AxiosRequestConfig,
): ApiRequestResponseType<D> => {
	return api.put(url, data, options);
};

export const patchData = <T, D>(
	url: string,
	data: T | undefined,
	options?: AxiosRequestConfig,
): ApiRequestResponseType<D> => {
	return api.patch(url, data, options);
};

export const deleteData = <T>(
	url: string,
	options?: AxiosRequestConfig,
): ApiRequestResponseType<T | undefined> => {
	return api.delete(url, options);
};

export const abortOutgoingRequest = () => {
	controller.abort();
};

export default api;
