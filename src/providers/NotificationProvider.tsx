import React, { memo, useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useQueryClient } from '@tanstack/react-query';
import { showMessage } from 'react-native-flash-message';
import { NavigationContainerRef } from '@react-navigation/native';

import { registerForPushNotificationsAsync } from '../services/NotificationService';
import { connectSocket, disconnectSocket } from '../services/socketService';
import {
	subscribeToPushNotifications,
	unsubscribeFromPushNotifications,
} from '../api/notifications';
import { useNotificationStore } from '../shared/notification-store/useNotificationStore';
import { useUserStore } from '../shared/user-store/useUserStore';
import { getAppNeededDetails } from '../utils/storage';
import type { RootStackParamList } from '../types/navigation.types';
import type { InAppNotification } from '../api/notifications';

interface NotificationProviderProps {
	children: React.ReactNode;
	navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}

// MMKV key for the stored push token (for logout cleanup)
const PUSH_TOKEN_KEY = 'expo_push_token';

function NotificationProviderInner({
	children,
	navigationRef,
}: NotificationProviderProps) {
	const queryClient = useQueryClient();
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const user = useUserStore((state) => state.user);
	const incrementUnreadCount = useNotificationStore(
		(state) => state.incrementUnreadCount,
	);
	const resetUnreadCount = useNotificationStore(
		(state) => state.resetUnreadCount,
	);

	const appStateRef = useRef<AppStateStatus>(AppState.currentState);
	const pushTokenRef = useRef<string | null>(null);
	const notificationResponseSub = useRef<Notifications.EventSubscription | null>(null);

	// ── Dynamic foreground/background notification handler ──
	const updateNotificationHandler = useCallback((isForeground: boolean) => {
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: !isForeground,
				shouldPlaySound: !isForeground,
				shouldSetBadge: false,
				shouldShowBanner: !isForeground,
				shouldShowList: true,
			}),
		});
	}, []);

	// ── Register push token with backend ──
	const registerPushToken = useCallback(async () => {
		if (!user?._id) return;

		try {
			const token = await registerForPushNotificationsAsync();
			if (token) {
				pushTokenRef.current = token;
				await subscribeToPushNotifications(user._id, token);
				console.log('[NotificationProvider] Push token registered');
			}
		} catch (error) {
			console.warn('[NotificationProvider] Push token registration failed:', error);
		}
	}, [user?._id]);

	// ── Unregister push token from backend ──
	const unregisterPushToken = useCallback(async (userId: string, token: string) => {
		try {
			await unsubscribeFromPushNotifications(userId, token);
			console.log('[NotificationProvider] Push token unregistered');
		} catch (error) {
			console.warn('[NotificationProvider] Push token unregister failed:', error);
		}
	}, []);

	// ── Handle Socket.IO new_notification event ──
	const handleNewNotification = useCallback(
		(notification: InAppNotification) => {
			// Update badge count
			incrementUnreadCount();

			// Invalidate the notifications query so list refreshes
			queryClient.invalidateQueries({ queryKey: ['inAppNotifications'] });

			// Show in-app toast
			showMessage({
				message: notification.title,
				description: notification.message,
				type: 'info',
				icon: 'info',
				duration: 4000,
			});
		},
		[incrementUnreadCount, queryClient],
	);

	// ── Connect Socket.IO ──
	const connectSocketIO = useCallback(async () => {
		const { userToken } = await getAppNeededDetails();
		if (!userToken) return;

		const socket = connectSocket(userToken);
		socket.on('new_notification', handleNewNotification);
	}, [handleNewNotification]);

	// ── Handle notification tap (from OS notification tray) ──
	const handleNotificationResponse = useCallback(
		(response: Notifications.NotificationResponse) => {
			const data = response.notification.request.content.data as
				| Record<string, unknown>
				| undefined;

			if (!data || !navigationRef.current) return;

			const notificationType = data.type as string | undefined;
			const isVendor = user?.isAdmin ?? false;

			// Small delay to ensure navigation is ready
			setTimeout(() => {
				const nav = navigationRef.current;
				if (!nav) return;

				switch (notificationType) {
					case 'chat_message':
						if (isVendor) {
							nav.navigate('Main', {
								screen: 'DashboardTab',
								params: { screen: 'Dashboard' },
							});
						} else {
							nav.navigate('Main', {
								screen: 'DocumentsTab',
								params: { screen: 'DocumentsList' },
							});
						}
						break;
					case 'document_status':
						nav.navigate('Main', {
							screen: 'DocumentsTab',
							params: { screen: 'DocumentsList' },
						});
						break;
					case 'new_document':
						nav.navigate('Main', {
							screen: 'DashboardTab',
							params: { screen: 'Dashboard' },
						});
						break;
					default:
						break;
				}
			}, 300);
		},
		[navigationRef, user?.isAdmin],
	);

	// ── App state change handler (foreground/background) ──
	useEffect(() => {
		if (!isAuthenticated) return;

		const subscription = AppState.addEventListener(
			'change',
			(nextAppState: AppStateStatus) => {
				const wasBg =
					appStateRef.current === 'background' ||
					appStateRef.current === 'inactive';
				const isNowFg = nextAppState === 'active';
				const isNowBg = nextAppState === 'background' || nextAppState === 'inactive';

				if (wasBg && isNowFg) {
					// App came to foreground
					updateNotificationHandler(true);
					connectSocketIO();
					// Refresh notification data
					queryClient.invalidateQueries({ queryKey: ['inAppNotifications'] });
				} else if (isNowBg) {
					// App went to background
					updateNotificationHandler(false);
					disconnectSocket();
				}

				appStateRef.current = nextAppState;
			},
		);

		return () => {
			subscription.remove();
		};
	}, [isAuthenticated, updateNotificationHandler, connectSocketIO, queryClient]);

	// ── Initial setup on authentication ──
	useEffect(() => {
		if (!isAuthenticated || !user?._id) return;

		// Set foreground handler
		updateNotificationHandler(true);

		// Register push token
		registerPushToken();

		// Connect Socket.IO
		connectSocketIO();

		// Listen for notification taps
		notificationResponseSub.current =
			Notifications.addNotificationResponseReceivedListener(
				handleNotificationResponse,
			);

		return () => {
			notificationResponseSub.current?.remove();
		};
	}, [
		isAuthenticated,
		user?._id,
		updateNotificationHandler,
		registerPushToken,
		connectSocketIO,
		handleNotificationResponse,
	]);

	// ── Cleanup on logout ──
	useEffect(() => {
		if (isAuthenticated) return;

		// User logged out
		const token = pushTokenRef.current;
		const userId = user?._id;

		if (token && userId) {
			unregisterPushToken(userId, token);
		}

		pushTokenRef.current = null;
		disconnectSocket();
		resetUnreadCount();
	}, [isAuthenticated, user?._id, unregisterPushToken, resetUnreadCount]);

	return <>{children}</>;
}

export const NotificationProvider = memo(NotificationProviderInner);
export default NotificationProvider;
