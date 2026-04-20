import React from 'react';
import { View } from 'react-native';
import { AlertCircleIcon } from 'src/assets/icons';
import TextComponent from '../ui/TextComponent';
import { cn } from '../../utils/class-names';

interface AuthErrorBannerProps {
	message: string | null;
	className?: string;
}

const AuthErrorBanner = ({ message, className }: AuthErrorBannerProps) => {
	if (!message) return null;

	return (
		<View
			className={cn(
				'flex-row items-center gap-3 bg-destructive/10 border border-destructive/20 p-4 rounded-2xl mx-6 mb-4',
				className,
			)}>
			<View className="bg-destructive/20 p-1.5 rounded-full">
				<AlertCircleIcon
					size={18}
					color="#ef4444"
				/>
			</View>
			<TextComponent className="flex-1 text-destructive font-medium text-sm leading-5">
				{message}
			</TextComponent>
		</View>
	);
};

export default AuthErrorBanner;
