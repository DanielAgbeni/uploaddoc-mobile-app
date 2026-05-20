import React, { memo, useCallback } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { TextComponent } from '../ui/TextComponent';
import { GoogleIcon } from '../../assets/icons';

interface SocialLoginSectionProps {
	onGoogleLogin: () => void;
	disabled?: boolean;
	isLoading: boolean;
}

const SocialLoginSection = memo(
	({ onGoogleLogin, disabled = false, isLoading }: SocialLoginSectionProps) => {
		const handleGooglePress = useCallback(() => {
			onGoogleLogin();
		}, [onGoogleLogin]);

		const isDisabled = disabled || isLoading;

		return (
			<View className="gap-3 mb-8">
				<Pressable
					className={`min-h-[56px] flex-row items-center justify-center rounded-2xl border border-border bg-background px-4 py-4 ${
						isDisabled ? 'opacity-50' : 'active:bg-muted'
					}`}
					disabled={isDisabled}
					onPress={handleGooglePress}
					hitSlop={6}>
					{isLoading ? (
						<View className="flex-row items-center justify-center gap-2">
							<ActivityIndicator
								size="small"
								color="#5461e8"
							/>
							<TextComponent className="font-semibold text-foreground">
								Connecting...
							</TextComponent>
						</View>
					) : (
						<>
							<GoogleIcon size={24} />
							<TextComponent className="ml-3 flex-1 text-center text-base font-semibold text-foreground">
								Continue with Google
							</TextComponent>
						</>
					)}
				</Pressable>
			</View>
		);
	},
);

export default SocialLoginSection;
