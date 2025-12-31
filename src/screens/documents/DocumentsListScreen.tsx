import React, { useState, useMemo, useCallback } from 'react';
import {
	View,
	Text,
	ActivityIndicator,
	TextInput,
	RefreshControl,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DocumentsStackParamList } from '../../types/navigation.types';
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query';
import { getStudentProjects, deleteProject } from '../../api/projects';
import DocumentsHeader from './components/DocumentsHeader';
import DocumentCard from './components/DocumentCard';
import { useDebounce } from 'use-debounce';
import * as Linking from 'expo-linking';
import { FlashList } from '@shopify/flash-list';
import SearchIcon from '../../assets/icons/search.icon';
import CloseCircleIcon from '../../assets/icons/close-circle.icon';
import AlertCircleIcon from '../../assets/icons/alert-circle.icon';
import DocumentTextIcon from '../../assets/icons/document-text.icon';
import AddIcon from '../../assets/icons/add.icon';
import { AlertModal } from '../../components/ui/AlertModal';
import { Pressable } from 'react-native';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'DocumentsList'>;

export default function DocumentsListScreen({ navigation }: Props) {
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearch] = useDebounce(searchQuery, 500);
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
		queryKey: ['studentProjects', debouncedSearch],
		queryFn: ({ pageParam = 1 }) =>
			getStudentProjects(pageParam, 10, debouncedSearch),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { currentPage, totalPages } = lastPage.data.data.pagination;
			return currentPage < totalPages ? currentPage + 1 : undefined;
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteProject,
		onSuccess: (data) => {
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
			console.error('Delete error:', error);
			setDeleteModalVisible(false); // Close invalid modal
			showMessage({
				message: 'Error',
				description:
					error.response?.data?.message || 'Failed to delete document',
				type: 'danger',
				icon: 'danger',
			});
		},
	});

	const handleDelete = useCallback((id: string) => {
		setProjectToDelete(id);
		setDeleteModalVisible(true);
	}, []);

	const confirmDelete = () => {
		if (projectToDelete) {
			deleteMutation.mutate(projectToDelete);
		} else {
			console.error('No project to delete found in state');
		}
	};

	const handleDownload = useCallback((url: string) => {
		Linking.openURL(url);
	}, []);

	const projects = useMemo(() => {
		return data?.pages.flatMap((page) => page.data.data.projects) || [];
	}, [data]);

	const renderItem = useCallback(
		({ item }: any) => (
			<DocumentCard
				project={item}
				onDelete={handleDelete}
				onDownload={handleDownload}
			/>
		),
		[handleDelete, handleDownload],
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
		return <View className="h-20" />; // Spacer
	};

	const renderEmpty = () => {
		if (isLoading) {
			return (
				<View className="flex-1 items-center justify-center py-20">
					<ActivityIndicator
						size="large"
						color="#4F46E5"
					/>
					<Text className="text-muted-foreground mt-4">
						Loading documents...
					</Text>
				</View>
			);
		}

		if (isError) {
			return (
				<View className="flex-1 items-center justify-center py-20 px-4">
					<AlertCircleIcon
						size={48}
						color="#ef4444"
					/>
					<Text className="text-destructive font-medium mt-4 text-center">
						Failed to load documents
					</Text>
					<Text
						className="text-sm text-muted-foreground mt-2 text-center"
						onPress={() => refetch()}>
						Tap to retry
					</Text>
				</View>
			);
		}

		return (
			<View className="flex-1 items-center justify-center py-20 px-4">
				<View className="bg-muted p-4 rounded-full mb-4">
					<DocumentTextIcon
						size={32}
						color="#94a3b8"
					/>
				</View>
				<Text className="text-lg font-semibold text-foreground">
					No documents found
				</Text>
				<Text className="text-muted-foreground text-center mt-2 max-w-xs">
					{searchQuery
						? 'No documents match your search criteria.'
						: "You haven't submitted any projects yet."}
				</Text>
			</View>
		);
	};

	return (
		<View className="flex-1 bg-background">
			<DocumentsHeader />

			<View className="flex-1 -mt-6">
				<View className="px-4 mb-4 z-20">
					<View className="bg-card border border-border rounded-xl flex-row items-center px-4 h-12 shadow-md">
						<View className="mr-2">
							<SearchIcon
								size={20}
								color="#94a3b8"
							/>
						</View>
						<TextInput
							placeholder="Search documents..."
							value={searchQuery}
							onChangeText={setSearchQuery}
							className="flex-1 text-foreground h-full font-medium"
							placeholderTextColor="#94a3b8"
						/>
						{searchQuery.length > 0 && (
							<Pressable onPress={() => setSearchQuery('')}>
								<CloseCircleIcon
									size={20}
									color="#94a3b8"
								/>
							</Pressable>
						)}
					</View>
				</View>

				<View className="flex-1 h-full min-h-0">
					<FlashList
						data={projects}
						renderItem={renderItem}
						estimatedItemSize={150}
						keyExtractor={(item) => item._id}
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
						contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
					/>
				</View>
			</View>

			{/* FAB */}
			<View className="absolute bottom-6 right-6">
				<Pressable
					className="shadow-lg shadow-primary/40 rounded-full w-[60px] h-[60px] bg-primary items-center justify-center active:opacity-90"
					onPress={() => navigation.navigate('SubmitDocument', {})}>
					<AddIcon
						size={30}
						color="#FFFFFF"
					/>
				</Pressable>
			</View>

			<AlertModal
				isVisible={deleteModalVisible}
				onClose={() => setDeleteModalVisible(false)}
				title="Delete Document"
				message="Are you sure you want to delete this document? This action cannot be undone."
				type="confirm"
				isDestructive={true}
				onConfirm={confirmDelete}
				confirmText={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
				cancelText="Cancel"
			/>
		</View>
	);
}
