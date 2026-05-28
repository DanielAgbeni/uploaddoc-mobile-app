import React, { memo, useCallback, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Pressable,
	RefreshControl,
	ScrollView,
	TextInput,
	View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { showMessage } from 'react-native-flash-message';
import CloseCircleIcon from '../../assets/icons/close-circle.icon';
import DocumentTextIcon from '../../assets/icons/document-text.icon';
import SearchIcon from '../../assets/icons/search.icon';
import AddIcon from '../../assets/icons/add.icon';
import AlertCircleIcon from '../../assets/icons/alert-circle.icon';
import AlertModal from '../../components/ui/AlertModal';
import TextComponent from '../../components/ui/TextComponent';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import { useTheme } from '../../providers/ThemeProvider';
import { useUserStore } from '../../shared/user-store/useUserStore';
import { DocumentsStackParamList } from '../../types/navigation.types';
import { downloadDocument } from '../../utils/fileDownload';
import { deleteProject, getStudentProjects } from '../../api/projects';
import DocumentCard from './components/DocumentCard';
import DocumentChatModal from './components/DocumentChatModal';
import DocumentCardSkeleton from './components/DocumentCardSkeleton';
import DocumentsHeader from './components/DocumentsHeader';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'DocumentsList'>;
type StatusFilter = 'all' | Project['status'];

const statusFilters: Array<{
	label: string;
	value: StatusFilter;
}> = [
	{ label: 'All', value: 'all' },
	{ label: 'Pending', value: 'pending' },
	{ label: 'Accepted', value: 'accepted' },
];

const StatusFilterChip = memo(function StatusFilterChip({
	active,
	label,
	onPress,
}: {
	active: boolean;
	label: string;
	onPress: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			className={`mr-3 rounded-full px-5 py-2 ${
				active ? 'bg-primary' : 'border border-border bg-card'
			}`}>
			<TextComponent
				className={`text-sm font-semibold ${
					active ? 'text-primary-foreground' : 'text-muted-foreground'
				}`}>
				{label}
			</TextComponent>
		</Pressable>
	);
});

function DocumentsListScreen({ navigation }: Props) {
	const { colors } = useTheme();
	const { user } = useUserStore();
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
	const [chatProject, setChatProject] = useState<Project | null>(null);
	const [chatModalVisible, setChatModalVisible] = useState(false);
	const [debouncedSearch] = useDebounce(searchQuery, 450);
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
		queryKey: ['studentProjects', { query: debouncedSearch }],
		queryFn: ({ pageParam = 1 }) =>
			getStudentProjects(pageParam, 10, { query: debouncedSearch }),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { currentPage, totalPages } = lastPage.data.data.pagination;
			return currentPage < totalPages ? currentPage + 1 : undefined;
		},
	});

	useRefreshOnFocus(refetch);

	const deleteMutation = useMutation({
		mutationFn: deleteProject,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['studentProjects'] });
			setDeleteModalVisible(false);
			setProjectToDelete(null);
			showMessage({
				message: 'Success',
				description: 'Document deleted successfully',
				type: 'success',
				icon: 'success',
			});
		},
		onError: (error: any) => {
			setDeleteModalVisible(false);
			showMessage({
				message: 'Error',
				description:
					error.response?.data?.message || 'Failed to delete document',
				type: 'danger',
				icon: 'danger',
			});
		},
	});

	const handleSearchChange = useCallback((value: string) => {
		setSearchQuery(value);
	}, []);

	const handleClearSearch = useCallback(() => {
		setSearchQuery('');
	}, []);

	const handleDelete = useCallback((id: string) => {
		setProjectToDelete(id);
		setDeleteModalVisible(true);
	}, []);

	const handleOpenChat = useCallback((project: Project) => {
		setChatProject(project);
		setChatModalVisible(true);
	}, []);

	const handleCloseDeleteModal = useCallback(() => {
		setDeleteModalVisible(false);
	}, []);

	const handleCloseChatModal = useCallback(() => {
		setChatModalVisible(false);
		setChatProject(null);
	}, []);

	const handleConfirmDelete = useCallback(() => {
		if (!projectToDelete) {
			return;
		}

		deleteMutation.mutate(projectToDelete);
	}, [deleteMutation, projectToDelete]);

	const handleDownload = useCallback(async (project: Project) => {
		if (!project.fileUrl) {
			showMessage({
				message: 'Error',
				description: 'No file URL available for this document',
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
					? `Saved to Downloads folder: ${project.title}`
					: `Saved to app storage: ${project.title}`,
				type: 'success',
				icon: 'success',
				duration: 4000,
			});
			return;
		}

		showMessage({
			message: 'Download Failed',
			description: result.error || 'An error occurred while downloading',
			type: 'danger',
			icon: 'danger',
		});
	}, []);

	const allProjects = useMemo(
		() => data?.pages.flatMap((page) => page.data.data.projects) || [],
		[data],
	);

	const filteredProjects = useMemo(() => {
		return allProjects.filter((project) => {
			if (statusFilter === 'all') {
				return true;
			}

			return project.status === statusFilter;
		});
	}, [allProjects, statusFilter]);

	const totalCount = useMemo(
		() => data?.pages[0]?.data.data.pagination.totalCount || 0,
		[data],
	);

	const counts = useMemo(
		() => ({
			pending: allProjects.filter((project) => project.status === 'pending')
				.length,
			accepted: allProjects.filter((project) => project.status === 'accepted')
				.length,
		}),
		[allProjects],
	);

	const activeFilterLabel = useMemo(
		() =>
			statusFilters.find((filter) => filter.value === statusFilter)?.label ||
			'All',
		[statusFilter],
	);

	const handleSelectFilter = useCallback((value: StatusFilter) => {
		setStatusFilter(value);
	}, []);

	const handleCreateDocument = useCallback(() => {
		navigation.navigate('SubmitDocument', {});
	}, [navigation]);

	const handleEndReached = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const renderItem = useCallback(
		({ item }: { item: Project }) => (
			<DocumentCard
				project={item}
				onChat={handleOpenChat}
				onDelete={handleDelete}
				onDownload={handleDownload}
			/>
		),
		[handleDelete, handleDownload, handleOpenChat],
	);

	const renderFooter = useCallback(() => {
		if (isFetchingNextPage) {
			return (
				<View className="py-5">
					<ActivityIndicator
						size="small"
						color={colors.primary}
					/>
				</View>
			);
		}

		return <View className="h-24" />;
	}, [colors.primary, isFetchingNextPage]);

	const renderEmpty = useCallback(() => {
		if (isLoading) {
			return (
				<View className=" pt-2">
					{Array.from({ length: 4 }).map((_, index) => (
						<DocumentCardSkeleton key={index} />
					))}
				</View>
			);
		}

		if (isError) {
			return (
				<View className="items-center justify-center px-6 py-24">
					<AlertCircleIcon
						size={48}
						color="#ef4444"
					/>
					<TextComponent className="mt-4 text-lg font-bold text-destructive">
						Failed to load documents
					</TextComponent>
					<Pressable
						onPress={() => refetch()}
						className="mt-3 rounded-full border border-border px-4 py-3">
						<TextComponent className="text-sm font-semibold text-muted-foreground">
							Tap to retry
						</TextComponent>
					</Pressable>
				</View>
			);
		}

		return (
			<View className="items-center justify-center px-6 py-24">
				<View className="mb-5 rounded-full border border-border bg-card p-5">
					<DocumentTextIcon
						size={34}
						color={colors.primary}
					/>
				</View>
				<TextComponent className="text-xl font-bold text-foreground">
					No documents found
				</TextComponent>
				<TextComponent className="mt-2 max-w-[280px] text-center text-base leading-7 text-muted-foreground">
					{debouncedSearch
						? 'No submissions match your current search. Try another keyword or switch filters.'
						: statusFilter === 'all'
							? "You haven't submitted any documents yet."
							: `No ${activeFilterLabel.toLowerCase()} submissions yet.`}
				</TextComponent>
			</View>
		);
	}, [
		activeFilterLabel,
		colors.primary,
		debouncedSearch,
		isError,
		isLoading,
		refetch,
		statusFilter,
	]);

	const listHeaderComponent = useMemo(
		() => (
			<View className="px-5 pb-2 pt-4">
				{/* Sleek Search Capsule */}
				<View className="mb-4 flex-row items-center rounded-2xl border border-border bg-card px-4 shadow-sm">
					<SearchIcon
						size={18}
						color={colors.mutedForeground}
					/>
					<TextInput
						placeholder="Search submissions"
						value={searchQuery}
						onChangeText={handleSearchChange}
						className="flex-1 px-3 py-3.5 text-base text-foreground"
						placeholderTextColor={colors.mutedForeground}
					/>
					{searchQuery.length > 0 ? (
						<Pressable
							onPress={handleClearSearch}
							className="min-h-[40px] min-w-[40px] items-center justify-center">
							<CloseCircleIcon
								size={18}
								color={colors.mutedForeground}
							/>
						</Pressable>
					) : null}
				</View>

				{/* Filter Row and Results Count */}
				<View className="mb-2 flex-row items-center justify-between">
					<View className="flex-1 mr-3">
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ paddingRight: 10, paddingBottom: 2 }}>
							{statusFilters.map((filter) => (
								<StatusFilterChip
									key={filter.value}
									label={filter.label}
									active={filter.value === statusFilter}
									onPress={() => handleSelectFilter(filter.value)}
								/>
							))}
						</ScrollView>
					</View>

					<View className="pl-1">
						<TextComponent className="text-xs font-bold text-muted-foreground uppercase tracking-[0.5px]">
							{filteredProjects.length} {filteredProjects.length === 1 ? 'doc' : 'docs'}
						</TextComponent>
					</View>
				</View>
			</View>
		),
		[
			colors.mutedForeground,
			filteredProjects.length,
			handleClearSearch,
			handleSearchChange,
			handleSelectFilter,
			searchQuery,
			statusFilter,
		],
	);

	const firstName = useMemo(
		() => user?.name?.split(' ')[0] || 'User',
		[user?.name],
	);

	return (
		<View className="flex-1 bg-background">
			<DocumentsHeader
				firstName={firstName}
				profilePicture={user?.profilePicture}
				totalCount={totalCount}
				pendingCount={counts.pending}
				acceptedCount={counts.accepted}
			/>

			<View className="flex-1">
				<FlashList
					data={filteredProjects}
					renderItem={renderItem}
					estimatedItemSize={190}
					keyExtractor={(item) => item._id}
					onEndReached={handleEndReached}
					onEndReachedThreshold={0.35}
					ListHeaderComponent={listHeaderComponent}
					ListFooterComponent={renderFooter}
					ListEmptyComponent={renderEmpty}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching && !isFetchingNextPage}
							onRefresh={refetch}
							tintColor={colors.primary}
						/>
					}
					contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
				/>
			</View>


			<AlertModal
				isVisible={deleteModalVisible}
				onClose={handleCloseDeleteModal}
				title="Delete Document"
				message="Are you sure you want to delete this document? This action cannot be undone."
				type="confirm"
				isDestructive={true}
				onConfirm={handleConfirmDelete}
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

export default memo(DocumentsListScreen);
