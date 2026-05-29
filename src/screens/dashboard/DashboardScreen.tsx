import React, { useState, useMemo, useCallback } from 'react';
import {
	View,
	ActivityIndicator,
	RefreshControl,
	StatusBar,
	TextInput,
	Pressable,
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
import { downloadDocument } from '../../utils/fileDownload';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../providers/ThemeProvider';
import { useDebounce } from 'use-debounce';
import { SearchIcon, icon } from '../../assets/icons';
import { TextComponent, CustomImage } from 'src/components';
import CloseCircleIcon from '../../assets/icons/close-circle.icon';
import { useUserStore } from '../../shared/user-store/useUserStore';
import DocumentChatModal from '../documents/components/DocumentChatModal';

type Props = NativeStackScreenProps<MainTabParamList, 'DashboardTab'>;

function DashboardScreen({ navigation }: Props) {
	const insets = useSafeAreaInsets();
	const { colors, colorScheme } = useTheme();
	const { user } = useUserStore();
	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
	const [chatProject, setChatProject] = useState<Project | null>(null);
	const [chatModalVisible, setChatModalVisible] = useState(false);
	const queryClient = useQueryClient();

	const firstName = useMemo(
		() => user?.name?.split(' ')[0] || 'User',
		[user?.name],
	);

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

	const handleOpenChat = useCallback((project: Project) => {
		setChatProject(project);
		setChatModalVisible(true);
	}, []);

	const handleCloseChatModal = useCallback(() => {
		setChatModalVisible(false);
		setChatProject(null);
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
				onChat={handleOpenChat}
				isAccepting={acceptMutation.isPending}
			/>
		),
		[handleAccept, handleDelete, handleDownload, handleOpenChat, acceptMutation.isPending],
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
				barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
				backgroundColor="transparent"
				translucent
			/>

			{/* Clean Neutral Header */}
			<View
				className="px-5 pb-5 border-b border-border/50 bg-background"
				style={{ paddingTop: insets.top + 16 }}>
				
				{/* Top row: Brand & Profile Avatar */}
				<View className="flex-row items-center justify-between mb-5">
					{/* Logo Mark + Brand Title */}
					<View className="flex-row items-center">
						<View className="h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mr-2.5">
							<CustomImage
								source={icon}
								className="h-5 w-5 rounded-full"
								contentFit="cover"
							/>
						</View>
						<TextComponent className="text-xl font-extrabold tracking-tight text-foreground">
							UploadDoc
						</TextComponent>
					</View>

					{/* User Avatar Circle */}
					<View className="h-9 w-9 overflow-hidden rounded-full border border-border bg-card shadow-sm">
						<CustomImage
							source={
								user?.profilePicture
									? { uri: user.profilePicture }
									: icon
							}
							className="h-full w-full rounded-full"
							contentFit="cover"
						/>
					</View>
				</View>

				{/* Welcome Message Label */}
				<View>
					
					<TextComponent className="text-4xl font-black text-foreground mt-0.5 leading-9">
						Vendor Dashboard
					</TextComponent>
				</View>
			</View>

			{/* Sleek Search Capsule */}
			<View className="px-5 pt-4 pb-2">
				<View className="flex-row items-center rounded-2xl border border-border bg-card px-4 shadow-sm h-12">
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
						<Pressable
							onPress={handleClearSearch}
							className="p-1">
							<CloseCircleIcon
								size={18}
								color={colors.mutedForeground}
							/>
						</Pressable>
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

			<DocumentChatModal
				isVisible={chatModalVisible}
				onClose={handleCloseChatModal}
				project={chatProject}
				currentUser={user ?? null}
			/>
		</View>
	);
}

export default React.memo(DashboardScreen);
