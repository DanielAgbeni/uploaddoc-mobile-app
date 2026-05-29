import { getData, postData, putData } from './index';

// ---- Types ----

export interface InAppNotification {
	_id: string;
	recipient: string;
	sender?: { _id: string; name: string; profilePicture?: string };
	type: 'document_status' | 'new_document' | 'chat_message';
	title: string;
	message: string;
	documentId?: string;
	isRead: boolean;
	createdAt: string;
}

export interface InAppNotificationsResponse {
	notifications: InAppNotification[];
	unreadCount: number;
	pagination: {
		totalCount: number;
		totalPages: number;
		currentPage: number;
		limit: number;
	};
}

// ---- Push Notification APIs ----

// Mobile push tokens are strings, Web Push uses PushSubscription object
export const subscribeToPushNotifications = async (
	userId: string,
	subscription: string,
) => {
	return postData('/api/notifications/subscribe', {
		uid: userId,
		subscription,
	});
};

export const unsubscribeFromPushNotifications = async (
	userId: string,
	endpoint: string,
) => {
	return postData('/api/notifications/unsubscribe', {
		uid: userId,
		endpoint,
	});
};

export const sendNotification = async (
	recipientUid: string,
	senderName: string,
	messageContent: string,
) => {
	return postData('/api/notifications/send-notification', {
		recipientUid,
		senderName,
		messageContent,
	});
};

// ---- In-App Notification APIs ----

export const getInAppNotifications = async (page: number = 1, limit: number = 20) => {
	return getData<InAppNotificationsResponse>(
		`/api/notifications/in-app?page=${page}&limit=${limit}`,
	);
};

export const markNotificationAsRead = async (notificationId: string) => {
	return putData('/api/notifications/in-app/read', { notificationId });
};

export const markAllNotificationsAsRead = async () => {
	return putData('/api/notifications/in-app/read-all', undefined);
};
