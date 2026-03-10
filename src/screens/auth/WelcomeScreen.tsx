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

const FeatureItem = ({ icon: Icon, title, subtitle, color }: { icon: any, title: string, subtitle: string, color: string }) => (
	<View className="flex-row items-center mb-6">
		<View className="w-14 h-14 rounded-2xl items-center justify-center mr-4 overflow-hidden bg-background">
			<View className="absolute inset-0 opacity-10" style={{ backgroundColor: color }} />
			<Icon size={24} color={color} />
		</View>
		<View className="flex-1">
			<Text className="text-foreground text-lg font-bold mb-1">{title}</Text>
			<Text className="text-muted-foreground text-sm font-medium leading-5">{subtitle}</Text>
		</View>
	</View>
);

const WelcomeScreen = memo(function WelcomeScreen({ navigation }: Props) {
	const { colors, colorScheme } = useTheme();
	const insets = useSafeAreaInsets();
	const [isModalVisible, setModalVisible] = useState(false);

	return (
		<View className="flex-1 bg-background relative">
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

			{/* Decorative Background Blobs */}
			<View 
				className="absolute top-[-5%] right-[-20%] w-96 h-96 rounded-full opacity-10" 
				style={{ backgroundColor: colors.primary }} 
				pointerEvents="none" 
			/>
			<View 
				className="absolute top-[25%] left-[-10%] w-64 h-64 rounded-full opacity-10" 
				style={{ backgroundColor: colors.primary }} 
				pointerEvents="none" 
			/>

			{/* Top Hero Section */}
			<View className="flex-[0.45] items-center justify-center px-6 pt-12">
				<View className="w-40 h-40 bg-card rounded-[40px] items-center justify-center mb-6 shadow-sm border border-border">
					<CustomImage
						source={require('../../assets/app-images/icon.png')}
						className="w-32 h-32 rounded-3xl"
						contentFit="contain"
					/>
				</View>

				<Text className="text-foreground text-5xl font-extrabold mb-3 tracking-tighter text-center">
					UploadDoc
				</Text>
				<Text className="text-muted-foreground text-center text-lg leading-7 font-medium max-w-[280px]">
					Send, receive, and manage documents with absolute ease.
				</Text>
			</View>

			{/* Bottom Sheet-like Container */}
			<View className="flex-[0.55] bg-card rounded-t-[40px] px-8 pt-10 pb-6 shadow-lg border-t border-border justify-between">
				<View>
					<FeatureItem
						icon={UploadIcon}
						title="Instant Uploads"
						subtitle="Share PDFs & documents securely"
						color={colors.primary}
					/>
					<FeatureItem
						icon={ShieldIcon}
						title="Verified Vendors"
						subtitle="Connect with trusted professionals"
						color={colors.primary}
					/>
					<FeatureItem
						icon={ClockIcon}
						title="Receive Documents"
						subtitle="Receive processed documents with ease"
						color={colors.primary}
					/>
				</View>

				<View style={{ paddingBottom: Math.max(insets.bottom, 16) }} className="mt-4">
					<Pressable
						onPress={() => setModalVisible(true)}
						className="w-full rounded-2xl py-4 items-center justify-center active:opacity-80"
						style={{ 
							backgroundColor: colors.primary,
							shadowColor: colors.primary,
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.3,
							shadowRadius: 8,
							elevation: 5
						}}>
						<Text className="text-white font-bold text-lg tracking-wide">
							Get Started Now
						</Text>
					</Pressable>
					<Text className="text-muted-foreground text-center text-xs mt-4 font-medium opacity-80">
						Secure, fast, and reliable document management
					</Text>
				</View>
			</View>

			<AuthModal
				isVisible={isModalVisible}
				onClose={() => setModalVisible(false)}
			/>
		</View>
	);
});

export default WelcomeScreen;
