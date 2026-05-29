import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { View, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react-native';
import { showMessage } from 'react-native-flash-message';
import { useTheme } from '../../providers/ThemeProvider';
import TextComponent from '../../components/ui/TextComponent';
import {
	getInAppNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
} from '../../api/notifications';
import type { InAppNotification } from '../../api/notifications';
import { useNotificationStore } from '../../shared/notification-store/useNotificationStore';
import { useUserStore } from '../../shared/user-store/useUserStore';
import NotificationItem from './components/NotificationItem';
import NotificationItemSkeleton from './components/NotificationItemSkeleton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DocumentsStackParamList, DashboardStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<
	DocumentsStackParamList | DashboardStackParamList,
	'Notifications'
>;

function NotificationsScreen({ navigation }: Props) {
	const insets = useSafeAreaInsets();
	const { colors, colorScheme } = useTheme();
	const queryClient = useQueryClient();
	const user = useUserStore((state) => state.user);
	const unreadCount = useNotificationStore((state) => state.unreadCount);
	const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
	const decrementUnreadCount = useNotificationStore((state) => state.decrementUnreadCount);
	const resetUnreadCount = useNotificationStore((state) => state.resetUnreadCount);

	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
	} = useInfiniteQuery({
		queryKey: ['inAppNotifications'],
		queryFn: ({ pageParam = 1 }) => getInAppNotifications(pageParam, 20),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const pagination = lastPage?.data?.pagination;
			if (!pagination) return undefined;
			const { currentPage, totalPages } = pagination;
			return currentPage < totalPages ? currentPage + 1 : undefined;
		},
		refetchInterval: 60000,
	});

	// Update unread count when data is fetched/refetched
	useEffect(() => {
		const firstPage = data?.pages[0];
		if (firstPage?.data?.unreadCount !== undefined) {
			setUnreadCount(firstPage.data.unreadCount);
		}
	}, [data, setUnreadCount]);

	const markReadMutation = useMutation({
		mutationFn: markNotificationAsRead,
		onSuccess: () => {
			decrementUnreadCount();
			queryClient.invalidateQueries({ queryKey: ['inAppNotifications'] });
		},
	});

	const markAllReadMutation = useMutation({
		mutationFn: markAllNotificationsAsRead,
		onSuccess: () => {
			resetUnreadCount();
			queryClient.invalidateQueries({ queryKey: ['inAppNotifications'] });
			showMessage({
				message: 'All Caught Up',
				description: 'All notifications marked as read',
				type: 'success',
				icon: 'success',
			});
		},
		onError: () => {
			showMessage({
				message: 'Error',
				description: 'Failed to mark all as read',
				type: 'danger',
				icon: 'danger',
			});
		},
	});

	const notifications = useMemo(() => {
		return data?.pages.flatMap((page) => page.data.notifications) ?? [];
	}, [data]);

	const handleGoBack = useCallback(() => {
		navigation.goBack();
	}, [navigation]);

	const handleMarkAllRead = useCallback(() => {
		markAllReadMutation.mutate();
	}, [markAllReadMutation]);

	const handleNotificationPress = useCallback(
		(notification: InAppNotification) => {
			// Mark as read if unread
			if (!notification.isRead) {
				markReadMutation.mutate(notification._id);
			}

			// Navigate based on type
			const isVendor = user?.isAdmin ?? false;

			switch (notification.type) {
				case 'chat_message':
					// Go back to the list screen — the chat modal can be opened from there
					navigation.goBack();
					break;
				case 'document_status':
					// Student screen — go back to documents list
					navigation.goBack();
					break;
				case 'new_document':
					// Vendor screen — go back to dashboard
					navigation.goBack();
					break;
				default:
					navigation.goBack();
					break;
			}
		},
		[markReadMutation, navigation, user?.isAdmin],
	);

	const handleEndReached = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const renderItem = useCallback(
		({ item }: { item: InAppNotification }) => (
			<NotificationItem
				notification={item}
				onPress={handleNotificationPress}
			/>
		),
		[handleNotificationPress],
	);

	const renderFooter = useCallback(() => {
		if (isFetchingNextPage) {
			return (
				<View className="py-4">
					<ActivityIndicator size="small" color={colors.primary} />
				</View>
			);
		}
		return <View className="h-24" />;
	}, [isFetchingNextPage, colors.primary]);

	const renderEmpty = useCallback(() => {
		if (isLoading) {
			return (
				<View className="py-2">
					{[...Array(8)].map((_, index) => (
						<NotificationItemSkeleton key={index} />
					))}
				</View>
			);
		}
		return (
			<View className="flex-1 items-center justify-center py-20 px-8">
				<View className="h-16 w-16 items-center justify-center rounded-full bg-muted/30 mb-4">
					<Bell size={28} color={colors.mutedForeground} />
				</View>
				<TextComponent className="text-lg font-bold text-foreground mb-1">
					No notifications yet
				</TextComponent>
				<TextComponent className="text-sm text-muted-foreground text-center leading-5">
					When you receive notifications about documents or messages, they'll appear
					here.
				</TextComponent>
			</View>
		);
	}, [isLoading, colors.mutedForeground]);

	return (
		<View className="flex-1 bg-background">
			{/* Header */}
			<View
				className="px-5 pb-4 border-b border-border/50 bg-background"
				style={{ paddingTop: insets.top + 12 }}>
				<View className="flex-row items-center justify-between">
					{/* Back Button + Title */}
					<View className="flex-row items-center gap-3">
						<Pressable
							onPress={handleGoBack}
							className="h-9 w-9 items-center justify-center rounded-full bg-card border border-border"
							style={({ pressed }) => ({
								opacity: pressed ? 0.7 : 1,
							})}>
							<ArrowLeft size={20} color={colors.foreground} />
						</Pressable>

						<View>
							<TextComponent className="text-xl font-bold text-foreground">
								Notifications
							</TextComponent>
							{unreadCount > 0 ? (
								<TextComponent className="text-xs text-muted-foreground">
									{unreadCount} unread
								</TextComponent>
							) : null}
						</View>
					</View>

					{/* Mark All Read Button */}
					{unreadCount > 0 ? (
						<Pressable
							onPress={handleMarkAllRead}
							disabled={markAllReadMutation.isPending}
							className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20"
							style={({ pressed }) => ({
								opacity: pressed ? 0.7 : 1,
							})}>
							<CheckCheck size={14} color={colors.primary} />
							<TextComponent className="text-xs font-semibold text-primary">
								{markAllReadMutation.isPending ? 'Marking...' : 'Mark All Read'}
							</TextComponent>
						</Pressable>
					) : null}
				</View>
			</View>

			{/* Notification List */}
			<FlashList
				data={notifications}
				renderItem={renderItem}
				estimatedItemSize={80}
				keyExtractor={(item) => item._id}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.5}
				ListFooterComponent={renderFooter}
				ListEmptyComponent={renderEmpty}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching && !isFetchingNextPage}
						onRefresh={refetch}
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
			/>
		</View>
	);
}

export default memo(NotificationsScreen);
