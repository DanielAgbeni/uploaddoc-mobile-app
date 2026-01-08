import api, { postData } from './index';

// Mobile push tokens are strings, Web Push uses PushSubscription object
export const subscribeToPushNotifications = async (
	userId: string,
	subscription: any,
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
