import React, { memo, useState } from 'react';
import { View, Text, ScrollView, Dimensions, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../providers/ThemeProvider';
import { StatusBar } from 'expo-status-bar';
import { UploadIcon, UserIcon, MapPinIcon, icon } from 'src/assets/icons';
import CustomImage from '../../components/common/CustomImage';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthModal from '../../components/auth/AuthModal';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const { width } = Dimensions.get('window');

const OnboardingScreen = memo(function OnboardingScreen({ navigation }: Props) {
	const { colorScheme, colors } = useTheme();
	const insets = useSafeAreaInsets();
	const [isModalVisible, setModalVisible] = useState(false);

	const features = [
		{
			icon: (
				<UploadIcon
					size={32}
					color="#4F46E5"
				/>
			),
			title: 'Upload Your Document',
			description: 'We support all printable document formats',
		},
		{
			icon: (
				<UserIcon
					size={32}
					color="#4F46E5"
				/>
			),
			title: 'Select a Vendor',
			description:
				'Choose from a list of verified local vendors and print shops near you.',
		},
		{
			icon: (
				<MapPinIcon
					size={32}
					color="#4F46E5"
				/>
			),
			title: 'Track & Collect',
			description:
				'Receive real-time updates on your document status. Pick up when ready.',
		},
	];

	return (
		<View className="flex-1 bg-background">
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}>
				{/* Header Section */}
				<View className="px-6 pt-16 pb-8 items-center">
					<Animated.View
						entering={FadeInDown.delay(200)}
						className="mb-8 shadow-lg">
						<CustomImage
							source={icon}
							className="w-40 h-40 rounded-[28px]"
							contentFit="cover"
						/>
					</Animated.View>

					<Animated.Text
						entering={FadeInDown.delay(300)}
						className="text-4xl font-extrabold text-center text-foreground mb-4 leading-tight">
						UploadDoc: Document management, simplified
					</Animated.Text>

					<Animated.Text
						entering={FadeInDown.delay(400)}
						className="text-muted-foreground text-center text-base leading-6 mb-8 px-2">
						UploadDoc allows students and professionals to easily upload, track,
						and manage documents. Connect with trusted vendors and streamline
						your document submission process today.
					</Animated.Text>
				</View>

				{/* How It Works Section */}
				<View className="px-6 py-8 bg-card/50">
					<Animated.Text
						entering={FadeInUp.delay(500)}
						className="text-2xl font-bold text-center text-foreground mb-3">
						How it works
					</Animated.Text>
					<Animated.Text
						entering={FadeInUp.delay(600)}
						className="text-sm text-center text-muted-foreground mb-8">
						Get your documents printed in 3 simple steps. No more waiting in
						lines.
					</Animated.Text>

					<View className="gap-8">
						{features.map((feature, index) => (
							<Animated.View
								key={index}
								entering={FadeInUp.delay(700 + index * 100)}
								className="flex-row items-center bg-background p-4 rounded-2xl shadow-sm border border-border">
								<View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center mr-4">
									{feature.icon}
									<View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary items-center justify-center border-2 border-background">
										<Text className="text-[10px] font-bold text-white">
											{index + 1}
										</Text>
									</View>
								</View>
								<View className="flex-1">
									<Text className="text-lg font-bold text-foreground mb-1">
										{feature.title}
									</Text>
									<Text className="text-sm text-muted-foreground leading-5">
										{feature.description}
									</Text>
								</View>
							</Animated.View>
						))}
					</View>
				</View>
			</ScrollView>

			{/* Bottom Action Area */}
			<Animated.View
				entering={FadeInUp.delay(1000)}
				className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t border-border"
				style={{ paddingBottom: insets.bottom + 16 }}>
				<View className="w-full">
					<Pressable
						onPress={() => setModalVisible(true)}
						className="w-full bg-primary rounded-xl py-4 items-center justify-center active:opacity-90 shadow-sm">
						<Text className="text-white font-bold text-lg">
							Get Started Now →
						</Text>
					</Pressable>
				</View>
			</Animated.View>

			<AuthModal
				isVisible={isModalVisible}
				onClose={() => setModalVisible(false)}
			/>
		</View>
	);
});

export default memo(OnboardingScreen);
