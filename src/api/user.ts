import { putData } from '.';

export const updateProfile = (data: any): ApiRequestResponseType<any> => {
	return putData('/api/users/update-profile', data);
};
