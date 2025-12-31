import { deleteData, getData, putData } from './index';

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
