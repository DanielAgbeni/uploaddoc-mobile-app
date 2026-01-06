import { deleteData, getData, postData, putData } from './index';

export const acceptProject = async (projectId: string) => {
	return putData<undefined, { success: boolean; message: string }>(
		`/api/projects/accept/${projectId}`,
		undefined,
	);
};

export const deleteProject = async (projectId: string) => {
	return deleteData<{ success: boolean; message: string }>(
		`/api/projects/delete/${projectId}`,
	);
};

export const getStudentProjects = async (
	page: number = 1,
	limit: number = 10,
	search: string = '',
) => {
	const searchParams = search ? `&search=${encodeURIComponent(search)}` : '';
	return getData<ProjectsResponse>(
		`/api/projects/student?page=${page}&limit=${limit}${searchParams}`,
	);
};

export const getAssignedProjects = async (
	page: number = 1,
	limit: number = 10,
	search: string = '',
) => {
	const searchParams = search ? `&search=${encodeURIComponent(search)}` : '';
	return getData<ProjectsResponse>(
		`/api/projects/assigned?page=${page}&limit=${limit}${searchParams}`,
	);
};

export const uploadProject = async (formData: FormData) => {
	return postData<FormData, UploadProjectResponse>(
		'/api/projects/upload',
		formData,
		{
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		},
	);
};

export const searchAdmins = async (query: string = '', limit: number = 5) => {
	const params = new URLSearchParams();
	if (query) params.append('query', query);
	params.append('limit', limit.toString());
	const queryString = params.toString() ? `?${params.toString()}` : '';
	return getData<AdminSearchResponse>(`/api/users/admins${queryString}`);
};
