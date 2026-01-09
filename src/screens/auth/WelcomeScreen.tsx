import React, { memo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import CustomImage from '../../components/common/CustomImage';
import { useTheme } from '../../providers/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { UploadIcon, ShieldIcon, ClockIcon } from 'src/assets/icons';
import AuthModal from '../../components/auth/AuthModal';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const WelcomeScreen = memo(function WelcomeScreen({ navigation }: Props) {
	const { colors, colorScheme } = useTheme();
	const insets = useSafeAreaInsets();
	const [isModalVisible, setModalVisible] = useState(false);

	return (
		<View className="flex-1 bg-background justify-between">
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

			{/* Zone A - Brand & Value (Top 35%) */}
			<View className="flex-[0.4] items-center justify-center px-6 pt-12">
				{/* App Icon */}
				<View className="w-20 h-20 bg-card rounded-2xl items-center justify-center mb-6 shadow-sm border border-border">
					<CustomImage
						source={require('../../assets/app-images/icon.png')}
						className="w-16 h-16 rounded-full"
						contentFit="contain"
					/>
				</View>

				{/* App Name */}
				<Text className="text-foreground text-4xl font-bold mb-4 tracking-tight">
					UploadDoc
				</Text>

				{/* Value Statement */}
				<Text className="text-muted-foreground text-center text-lg leading-7 font-medium max-w-xs">
					Send, track, and manage documents without stress.
				</Text>
			</View>

			{/* Zone B - Key Benefits (Middle 40%) */}
			<View className="flex-[0.4] px-8 justify-center gap-6">
				{/* Benefit 1 */}
				<View className="flex-row items-center bg-card p-4 rounded-xl border border-border">
					<UploadIcon
						size={20}
						color={colors.primary}
					/>
					<Text className="text-foreground text-base font-medium ml-4">
						Upload PDFs & documents instantly
					</Text>
				</View>

				{/* Benefit 2 */}
				<View className="flex-row items-center bg-card p-4 rounded-xl border border-border">
					<ShieldIcon
						size={20}
						color={colors.primary}
					/>
					<Text className="text-foreground text-base font-medium ml-4">
						Connect with verified vendors
					</Text>
				</View>

				{/* Benefit 3 */}
				<View className="flex-row items-center bg-card p-4 rounded-xl border border-border">
					<ClockIcon
						size={20}
						color={colors.primary}
					/>
					<Text className="text-foreground text-base font-medium ml-4">
						Track status in real time
					</Text>
				</View>
			</View>

			{/* Zone C - Primary Action (Bottom 25%) */}
			<View
				className="flex-[0.25] px-6 justify-center"
				style={{ paddingBottom: insets.bottom + 10 }}>
				<Pressable
					onPress={() => setModalVisible(true)}
					className="w-full rounded-2xl py-4 items-center justify-center active:opacity-90"
					style={{ backgroundColor: colors.primary }}>
					<Text className="text-white font-bold text-lg">Get Started</Text>
				</Pressable>

				<Text className="text-muted-foreground text-center text-xs mt-4 font-medium">
					No queues. No confusion.
				</Text>
			</View>

			<AuthModal
				isVisible={isModalVisible}
				onClose={() => setModalVisible(false)}
			/>
		</View>
	);
});

export default WelcomeScreen;
