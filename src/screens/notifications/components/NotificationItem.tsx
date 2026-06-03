import React, { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import {
	Bell,
	CheckCircle,
	AlertTriangle,
	FileText,
	MessageSquare,
} from 'lucide-react-native';
import { useTheme } from '../../../providers/ThemeProvider';
import TextComponent from '../../../components/ui/TextComponent';
import { formatDistanceToNow } from 'date-fns';
import type { InAppNotification } from '../../../api/notifications';

interface NotificationItemProps {
	notification: InAppNotification;
	onPress: (notification: InAppNotification) => void;
}

const ICON_CONFIG: Record<
	string,
	{ icon: typeof Bell; bgClass: string; colorLight: string; colorDark: string }
> = {
	chat_message: {
		icon: MessageSquare,
		bgClass: 'bg-blue-500/10',
		colorLight: '#2563eb',
		colorDark: '#3b82f6',
	},
	new_document: {
		icon: FileText,
		bgClass: 'bg-emerald-500/10',
		colorLight: '#059669',
		colorDark: '#10b981',
	},
	document_accepted: {
		icon: CheckCircle,
		bgClass: 'bg-emerald-500/10',
		colorLight: '#059669',
		colorDark: '#10b981',
	},
	document_rejected: {
		icon: AlertTriangle,
		bgClass: 'bg-rose-500/10',
		colorLight: '#e11d48',
		colorDark: '#fb7185',
	},
	default: {
		icon: Bell,
		bgClass: 'bg-primary/10',
		colorLight: '#444ebb',
		colorDark: '#444ebb',
	},
};

function getIconConfig(notification: InAppNotification) {
	if (notification.type === 'document_status') {
		const titleLower = notification.title.toLowerCase();
		if (titleLower.includes('accepted') || titleLower.includes('approved')) {
			return ICON_CONFIG.document_accepted;
		}
		if (titleLower.includes('rejected') || titleLower.includes('deleted')) {
			return ICON_CONFIG.document_rejected;
		}
	}
	return ICON_CONFIG[notification.type] ?? ICON_CONFIG.default;
}

const NotificationItem = memo(function NotificationItem({
	notification,
	onPress,
}: NotificationItemProps) {
	const { colorScheme } = useTheme();

	const handlePress = useCallback(() => {
		onPress(notification);
	}, [onPress, notification]);

	const config = getIconConfig(notification);
	const IconComponent = config.icon;
	const iconColor =
		colorScheme === 'dark' ? config.colorDark : config.colorLight;

	const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
		addSuffix: true,
	});

	return (
		<Pressable
			onPress={handlePress}
			className={`flex-row items-start px-5 py-4 gap-3 border-b border-border ${
				notification.isRead ? '' : 'bg-primary/5'
			}`}
			style={({ pressed }) => ({
				opacity: pressed ? 0.75 : 1,
			})}>
			{/* Type Icon */}
			<View
				className={`h-10 w-10 items-center justify-center rounded-full ${config.bgClass}`}>
				<IconComponent size={20} color={iconColor} />
			</View>

			{/* Content */}
			<View className="flex-1 gap-1">
				<View className="flex-row items-center gap-2">
					<TextComponent
						className={`flex-1 text-lg ${
							notification.isRead
								? 'font-medium text-foreground'
								: 'font-bold text-foreground'
						}`}
						numberOfLines={1}>
						{notification.title}
					</TextComponent>

					{/* Unread dot */}
					{!notification.isRead ? (
						<View className="h-2.5 w-2.5 rounded-full bg-primary" />
					) : null}
				</View>

				<TextComponent
					className="text-xs text-muted-foreground leading-4"
					numberOfLines={2}>
					{notification.message}
				</TextComponent>

				<TextComponent className="text-sm text-muted-foreground/70 mt-0.5">
					{timeAgo}
				</TextComponent>
			</View>
		</Pressable>
	);
});

export default NotificationItem;
