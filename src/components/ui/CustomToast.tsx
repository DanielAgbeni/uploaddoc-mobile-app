import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { hideMessage, MessageComponentProps } from 'react-native-flash-message';
import { cn } from '../../utils/class-names';
import TextComponent from './TextComponent';
import { SafeAreaView } from 'react-native-safe-area-context';
import CheckmarkCircleIcon from '../../assets/icons/checkmark-circle.icon';
import AlertCircleIcon from '../../assets/icons/alert-circle.icon';
import { useTheme } from '../../providers/ThemeProvider';

const CustomToastMessageComponent: React.FC<MessageComponentProps> = ({
	message,
}) => {
	const { colorScheme } = useTheme();
	const isDark = colorScheme === 'dark';

	// Solid colors for better visibility
	const getBackgroundColor = () => {
		switch (message.type) {
			case 'success':
				return 'bg-[#21CF46] dark:bg-[#1bb03a]'; // Vivid Green
			case 'danger':
				return 'bg-[#F22F22] dark:bg-[#d12419]'; // Vivid Red
			case 'warning':
				return 'bg-[#F9C034] dark:bg-[#d6a42b]'; // Vivid Yellow/Orange
			case 'info':
				return 'bg-[#3B82F6] dark:bg-[#2563eb]'; // Vivid Blue
			default:
				return 'bg-secondary dark:bg-card';
		}
	};

	return (
		<SafeAreaView edges={['top']}>
			<Pressable
				onPress={hideMessage}
				className={cn(
					'flex-row justify-between items-center gap-4 px-4 py-4 mx-4 rounded-xl shadow-lg',
					getBackgroundColor(),
				)}>
				<TextComponent className="flex-1 text-sm font-bold text-white">
					{message?.message}
				</TextComponent>

				<View>
					{message?.type === 'success' && (
						<CheckmarkCircleIcon
							color="#FFFFFF"
							size={24}
						/>
					)}
					{(message?.type === 'info' || message?.type === 'warning') && (
						<AlertCircleIcon
							color="#FFFFFF"
							size={24}
						/>
					)}
					{message?.type === 'danger' && (
						<AlertCircleIcon
							color="#FFFFFF"
							size={24}
						/>
					)}
				</View>
			</Pressable>
		</SafeAreaView>
	);
};

export default memo(CustomToastMessageComponent);
