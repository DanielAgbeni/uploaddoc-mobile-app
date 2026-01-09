import React, { memo } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { GoogleIcon } from 'src/assets/icons';
import { TextComponent } from '../ui/TextComponent';

interface SocialLoginSectionProps {
	onGoogleLogin: () => void;
	isLoading: boolean;
}

const SocialLoginSection = memo(
	({ onGoogleLogin, isLoading }: SocialLoginSectionProps) => {
		return (
			<View className="gap-3 mb-8">
				<Pressable
					className="flex-row items-center border border-border rounded-xl p-4 bg-background active:bg-muted justify-center"
					disabled={isLoading}
					onPress={onGoogleLogin}>
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
							<TextComponent className="flex-1 text-center font-semibold text-foreground ml-3">
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
