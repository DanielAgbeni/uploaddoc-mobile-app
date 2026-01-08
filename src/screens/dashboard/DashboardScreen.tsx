import React, { useState, useMemo, useCallback } from 'react';
import {
	View,
	Text,
	ActivityIndicator,
	RefreshControl,
	StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../types/navigation.types';
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import {
	getAssignedProjects,
	acceptProject,
	deleteProject,
} from '../../api/projects';
import DashboardHeader from './components/DashboardHeader';
import ProjectCard from './components/ProjectCard'; // Created
import { FlashList } from '@shopify/flash-list';
import { showMessage } from 'react-native-flash-message';
import { AlertModal } from '../../components/ui/AlertModal';
import {
	downloadDocument,
	getDownloadFolderPath,
} from '../../utils/fileDownload';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Assuming Dashboard is part of MainTabParamList
type Props = NativeStackScreenProps<MainTabParamList, 'DashboardTab'>;

export default function DashboardScreen({ navigation }: Props) {
	const insets = useSafeAreaInsets();
	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
	const queryClient = useQueryClient();

	const {
		data,
		isLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
	} = useInfiniteQuery({
		queryKey: ['assignedProjects'],
		queryFn: ({ pageParam = 1 }) => getAssignedProjects(pageParam, 10, ''),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (!lastPage?.data?.data?.pagination) return undefined;
			const { currentPage, totalPages } = lastPage.data.data.pagination;
			return currentPage < totalPages ? currentPage + 1 : undefined;
		},
	});

	// Mutations
	const acceptMutation = useMutation({
		mutationFn: acceptProject,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['assignedProjects'] });
			showMessage({
				message: 'Success',
				description: 'Project accepted',
				type: 'success',
				icon: 'success',
			});
		},
		onError: (error: any) => {
			showMessage({
				message: 'Error',
				description:
					error.response?.data?.message || 'Failed to accept project',
				type: 'danger',
				icon: 'danger',
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteProject,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['assignedProjects'] });
			setDeleteModalVisible(false);
			setProjectToDelete(null);
			showMessage({
				message: 'Success',
				description: 'Project deleted',
				type: 'success',
				icon: 'success',
			});
		},
		onError: (error: any) => {
			setDeleteModalVisible(false);
			showMessage({
				message: 'Error',
				description:
					error.response?.data?.message || 'Failed to delete project',
				type: 'danger',
				icon: 'danger',
			});
		},
	});

	// Handlers
	const handleAccept = useCallback((id: string) => {
		acceptMutation.mutate(id);
	}, []);

	const handleDelete = useCallback((id: string) => {
		setProjectToDelete(id);
		setDeleteModalVisible(true);
	}, []);

	const confirmDelete = () => {
		if (projectToDelete) {
			deleteMutation.mutate(projectToDelete);
		}
	};

	const handleDownload = useCallback(async (project: Project) => {
		if (!project.fileUrl) {
			showMessage({
				message: 'Error',
				description: 'No file URL available',
				type: 'danger',
				icon: 'danger',
			});
			return;
		}

		showMessage({
			message: 'Downloading...',
			description: `Starting download: ${project.title}`,
			type: 'info',
			icon: 'info',
		});

		const result = await downloadDocument(
			project.fileUrl,
			project.title,
			project.fileType,
		);

		if (result.success) {
			showMessage({
				message: 'Download Complete',
				description: result.isPublic
					? `Saved to Downloads`
					: `Saved to app storage`,
				type: 'success',
				icon: 'success',
			});
		} else {
			showMessage({
				message: 'Download Failed',
				description: result.error || 'Unknown error',
				type: 'danger',
				icon: 'danger',
			});
		}
	}, []);

	const projects = useMemo(() => {
		return data?.pages.flatMap((page) => page.data.data.projects) || [];
	}, [data]);

	const renderItem = useCallback(
		({ item }: { item: Project }) => (
			<ProjectCard
				project={item}
				onAccept={handleAccept}
				onDelete={handleDelete}
				onDownload={handleDownload}
				isAccepting={acceptMutation.isPending}
			/>
		),
		[handleAccept, handleDelete, handleDownload, acceptMutation.isPending],
	);

	const renderFooter = () => {
		if (isFetchingNextPage) {
			return (
				<View className="py-4">
					<ActivityIndicator
						size="small"
						color="#4F46E5"
					/>
				</View>
			);
		}
		return <View className="h-20" />;
	};

	const renderEmpty = () => {
		if (isLoading) {
			return (
				<View className="py-20 items-center">
					<ActivityIndicator
						size="large"
						color="#4F46E5"
					/>
				</View>
			);
		}
		return (
			<View className="py-20 px-4 items-center">
				<Text className="text-muted-foreground text-center">
					No assigned projects found.
				</Text>
			</View>
		);
	};

	return (
		<View
			className="flex-1 bg-background"
			style={{ paddingTop: insets.top }}>
			<StatusBar
				barStyle="dark-content"
				backgroundColor="transparent"
				translucent
			/>

			<View className="px-4 py-3">
				<Text className="text-2xl font-bold text-foreground">Dashboard</Text>
				<Text className="text-muted-foreground">
					Manage your assigned projects
				</Text>
			</View>

			<FlashList
				data={projects}
				renderItem={renderItem}
				estimatedItemSize={120}
				keyExtractor={(item) => item._id}
				ListHeaderComponent={<DashboardHeader />}
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) {
						fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.5}
				ListFooterComponent={renderFooter}
				ListEmptyComponent={renderEmpty}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching && !isFetchingNextPage}
						onRefresh={refetch}
						tintColor="#4F46E5"
					/>
				}
				contentContainerStyle={{ paddingBottom: 100 }}
			/>

			<AlertModal
				isVisible={deleteModalVisible}
				onClose={() => setDeleteModalVisible(false)}
				title="Delete Project"
				message="Are you sure you want to delete this project? This action cannot be undone."
				type="confirm"
				isDestructive={true}
				onConfirm={confirmDelete}
				confirmText={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
				cancelText="Cancel"
			/>
		</View>
	);
}
