import api from './index';
import { AdminsResponse, Admin } from '../types/navigation.types';

export interface FetchAdminsParams {
	page?: number;
	limit?: number;
	query?: string;
}

/**
 * Fetch admins/vendors with pagination and optional search
 */
export const fetchAdmins = async ({
	page = 1,
	limit = 12,
	query = '',
}: FetchAdminsParams = {}): Promise<AdminsResponse> => {
	const params = new URLSearchParams();
	params.append('page', page.toString());
	params.append('limit', limit.toString());
	if (query) {
		params.append('query', query);
	}
	const response = await api.get<AdminsResponse>(
		`/api/users/admins?${params.toString()}`,
	);
	return response.data;
};

export const fetchAdminById = async (id: string): Promise<{
	success: boolean;
	message: string;
	data: Admin;
}> => {
	const response = await api.get<{
		success: boolean;
		message: string;
		data: Admin;
	}>(`/api/users/${id}`);
	return response.data;
};

