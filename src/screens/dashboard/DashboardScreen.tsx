import React, { useState, useMemo, useCallback } from 'react';
import {
	View,
	Text,
	ActivityIndicator,
	RefreshControl,
	StatusBar,
	TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../types/navigation.types';
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import {
	getAssignedProjects,
	acceptProject,
	deleteProject,
} from '../../api/projects';
import DashboardHeader from './components/DashboardHeader';
import ProjectCard from './components/ProjectCard';
import ProjectCardSkeleton from './components/ProjectCardSkeleton';
import { FlashList } from '@shopify/flash-list';
import { showMessage } from 'react-native-flash-message';
import AlertModal from '../../components/ui/AlertModal';
import {
	downloadDocument,
	getDownloadFolderPath,
} from '../../utils/fileDownload';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../providers/ThemeProvider';
import { useDebounce } from 'use-debounce';
import DashboardIcon from '../../assets/icons/dashboard.icon';
import { SearchIcon } from '../../assets/icons'; // Assuming index.ts exports it
import { TextComponent } from 'src/components';
import CloseCircleIcon from '../../assets/icons/close-circle.icon';

type Props = NativeStackScreenProps<MainTabParamList, 'DashboardTab'>;

function DashboardScreen({ navigation }: Props) {
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
	const queryClient = useQueryClient();

	// Search State
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearch] = useDebounce(searchQuery, 500);

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
		queryKey: ['assignedProjects', debouncedSearch],
		queryFn: ({ pageParam = 1 }) =>
			getAssignedProjects(pageParam, 10, debouncedSearch),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (!lastPage?.data?.data?.pagination) return undefined;
			const { currentPage, totalPages } = lastPage.data.data.pagination;
			return currentPage < totalPages ? currentPage + 1 : undefined;
		},
	});

	useRefreshOnFocus(refetch);

	const handleRefresh = useCallback(() => {
		refetch();
		queryClient.invalidateQueries({ queryKey: ['userStatus'] });
		queryClient.invalidateQueries({ queryKey: ['allCloudStatus'] });
	}, [refetch, queryClient]);

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
	}, [acceptMutation]);

	const handleDelete = useCallback((id: string) => {
		setProjectToDelete(id);
		setDeleteModalVisible(true);
	}, []);

	const confirmDelete = useCallback(() => {
		if (projectToDelete) {
			deleteMutation.mutate(projectToDelete);
		}
	}, [deleteMutation, projectToDelete]);

	const handleSearchChange = useCallback((text: string) => {
		setSearchQuery(text);
	}, []);

	const handleClearSearch = useCallback(() => {
		setSearchQuery('');
	}, []);

	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalVisible(false);
	}, []);

	const handleEndReached = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

	const renderFooter = useCallback(() => {
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
	}, [isFetchingNextPage]);

	const renderEmpty = useCallback(() => {
		if (isLoading) {
			return (
				<View className="py-2">
					{[...Array(5)].map((_, index) => (
						<ProjectCardSkeleton key={index} />
					))}
				</View>
			);
		}
		return (
			<View className="py-20 px-4 items-center">
				<TextComponent className="text-muted-foreground text-center">
					{debouncedSearch
						? 'No documents matching your search.'
						: 'No assigned documents found.'}
				</TextComponent>
			</View>
		);
	}, [isLoading, debouncedSearch]);

	return (
		<View className="flex-1 bg-background">
			<StatusBar
				barStyle="light-content"
				backgroundColor="transparent"
				translucent
			/>

			{/* Gradient Header */}
			<LinearGradient
				colors={[colors.primary, colors.accent || '#4F46E5']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				className="pt-14 pb-12 px-6 rounded-b-3xl">
				<View className="items-center">
					<View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4">
						<DashboardIcon
							size={32}
							color="#fff"
						/>
					</View>
					<TextComponent className="text-white font-bold text-2xl mb-1">
						Dashboard
					</TextComponent>
					<TextComponent className="text-white/80 text-base text-center">
						Manage your assigned documents
					</TextComponent>
				</View>
			</LinearGradient>

			{/* Search Bar */}
			<View className="px-5 -mt-6 mb-2">
				<View className="bg-card border border-border rounded-xl flex-row items-center px-4 shadow-sm h-12">
					<SearchIcon
						size={18}
						color={colors.mutedForeground}
					/>
					<TextInput
						className="flex-1 ml-3 text-foreground text-base h-full font-medium"
						placeholder="Search documents..."
						placeholderTextColor={colors.mutedForeground}
						value={searchQuery}
						onChangeText={handleSearchChange}
					/>
					{searchQuery.length > 0 && (
						<View onTouchEnd={handleClearSearch}>
							<CloseCircleIcon
								size={18}
								color={colors.mutedForeground}
							/>
						</View>
					)}
				</View>
			</View>

			<FlashList
				data={projects}
				renderItem={renderItem}
				estimatedItemSize={120}
				keyExtractor={(item) => item._id}
				ListHeaderComponent={<DashboardHeader />}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.5}
				ListFooterComponent={renderFooter}
				ListEmptyComponent={renderEmpty}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching && !isFetchingNextPage}
						onRefresh={handleRefresh}
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
				contentContainerStyle={{ paddingBottom: insets.bottom > 0 ? insets.bottom + 100 : 120, paddingTop: 10 }}
			/>

			<AlertModal
				isVisible={deleteModalVisible}
				onClose={handleCloseDeleteModal}
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

export default React.memo(DashboardScreen);
