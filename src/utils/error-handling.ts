import { AxiosError } from 'axios';

export const getErrorMessage = (error: any): string => {
	if (error instanceof AxiosError) {
		const data = error.response?.data;
		if (data) {
			if (data.message) return data.message;
			if (data.errors) {
				if (typeof data.errors === 'string') return data.errors;
				if (typeof data.errors === 'object') {
					// Join values of the errors object
					return Object.values(data.errors).flat().join(', ');
				}
			}
		}
	}
	return error?.message || 'An unexpected error occurred';
};
