import api, { postData } from './index';

export const subscribeToPushNotifications = async (userId: string, subscription: PushSubscription) => {
    return postData('/api/notifications/subscribe', {
        uid: userId,
        subscription,
    });
};

export const unsubscribeFromPushNotifications = async (userId: string, endpoint: string) => {
    return postData('/api/notifications/unsubscribe', {
        uid: userId,
        endpoint,
    });
};

export const sendNotification = async (recipientUid: string, senderName: string, messageContent: string) => {
    return postData('/api/notifications/send-notification', {
        recipientUid,
        senderName,
        messageContent,
    });
};
