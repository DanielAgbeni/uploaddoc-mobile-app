import { showMessage } from 'react-native-flash-message';
import api, { deleteData, getData, postData, putData } from './index';
import { sendNotification } from './notifications';
import useUserStore from 'src/shared/user-store/useUserStore';

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
	options: {
		query?: string;
		search?: string;
	} = {},
) => {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	const normalizedQuery = options.query?.trim() || options.search?.trim() || '';

	if (normalizedQuery) {
		params.append('query', normalizedQuery);
		params.append('search', normalizedQuery);
	}

	return getData<ProjectsResponse>(`/api/projects/student?${params.toString()}`);
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
	try {
		// Get user from store imperatively (not as a hook)
		const user = useUserStore.getState().user;

		const response = await api.post('/api/projects/upload', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		if (response.data.success) {
			showMessage({
				message: 'Success',
				description: 'Project submitted successfully!',
				type: 'success',
				icon: 'success',
			});

			// Trigger Notification
			const assignedAdmin = formData.get('assignedAdmin') as string;
			const title = formData.get('title') as string;
			const fileName = (formData.get('file') as File)?.name;

			if (assignedAdmin && user) {
				try {
					// Check if title exists, if not use filename
					const docName = title || fileName || 'document';
					await sendNotification(
						assignedAdmin,
						user.name,
						`has submitted a document "${docName}"`,
					);
				} catch (notificationError) {
					console.error('Failed to send notification', notificationError);
					// Don't block the user flow if notification fails
				}
			}
		} else {
			showMessage({
				message: 'Error',
				description: response.data.message || 'Failed to submit project.',
				type: 'danger',
				icon: 'danger',
			});
		}

		return response.data;
	} catch (error: any) {
		console.error('Upload error:', error);
		showMessage({
			message: 'Error',
			description:
				error.response?.data?.message || 'An error occurred while uploading.',
			type: 'danger',
			icon: 'danger',
		});
		throw error;
	}
};

export const searchAdmins = async (query: string = '', limit: number = 5) => {
	const params = new URLSearchParams();
	if (query) params.append('query', query);
	params.append('limit', limit.toString());
	const queryString = params.toString() ? `?${params.toString()}` : '';
	return getData<AdminSearchResponse>(`/api/users/admins${queryString}`);
};
