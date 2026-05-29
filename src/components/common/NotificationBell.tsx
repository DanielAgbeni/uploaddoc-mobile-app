import React, { memo, useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { useNotificationStore } from '../../shared/notification-store/useNotificationStore';
import TextComponent from '../ui/TextComponent';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from 'react-native-reanimated';

interface NotificationBellProps {
	onPress: () => void;
	size?: number;
}

const NotificationBell = memo(function NotificationBell({
	onPress,
	size = 22,
}: NotificationBellProps) {
	const { colors } = useTheme();
	const unreadCount = useNotificationStore((state) => state.unreadCount);

	const badgeScale = useSharedValue(0);

	useEffect(() => {
		if (unreadCount > 0) {
			badgeScale.value = withSequence(
				withTiming(1.3, { duration: 150 }),
				withSpring(1, { damping: 12 }),
			);
		} else {
			badgeScale.value = withTiming(0, { duration: 150 });
		}
	}, [unreadCount, badgeScale]);

	const badgeAnimStyle = useAnimatedStyle(() => ({
		transform: [{ scale: badgeScale.value }],
	}));

	const displayCount = unreadCount > 9 ? '9+' : String(unreadCount);

	return (
		<Pressable
			onPress={onPress}
			className="relative h-9 w-9 items-center justify-center rounded-full bg-card border border-border"
			style={({ pressed }) => ({
				opacity: pressed ? 0.7 : 1,
			})}>
			<Bell size={size} color={colors.foreground} />

			{unreadCount > 0 ? (
				<Animated.View
					style={[badgeAnimStyle]}
					className="absolute -top-1 -right-1 min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-500 border-2 border-card px-0.5">
					<TextComponent className="text-[10px] font-bold text-white leading-[12px]">
						{displayCount}
					</TextComponent>
				</Animated.View>
			) : null}
		</Pressable>
	);
});

export default NotificationBell;
