import React, { memo, useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthModal from '../../components/auth/AuthModal';
import CustomImage from '../../components/common/CustomImage';
import { ArrowForwardIcon } from '../../assets/icons';
import { useTheme } from '../../providers/ThemeProvider';
import { AuthStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const welcomeBackground = require('../../assets/images/welcome-screen-background.png');

const WelcomeScreen = memo(function WelcomeScreen(_props: Props) {
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	const [isModalVisible, setModalVisible] = useState(false);

	const contentPaddingBottom = useMemo(
		() => Math.max(insets.bottom, 20),
		[insets.bottom],
	);

	const handleOpenModal = useCallback(() => {
		setModalVisible(true);
	}, []);

	const handleCloseModal = useCallback(() => {
		setModalVisible(false);
	}, []);

	return (
		<View className="flex-1 bg-[#020816]">
			<StatusBar style="light" />

			<View className="absolute inset-0 items-center justify-center bg-[#020816]">
				<CustomImage
					source={welcomeBackground}
					className="h-full w-full"
					contentFit="contain"
				/>
			</View>

			<View
				className="flex-1 px-6"
				style={{
					paddingBottom: contentPaddingBottom,
				}}>
				<View className="flex-1" />

				<Pressable
					onPress={handleOpenModal}
					className="flex-row items-center justify-center rounded-md px-6 py-5 active:opacity-95"
					style={{ backgroundColor: colors.primary }}>
					<Text className="mr-3 text-lg font-extrabold tracking-tight text-white">
						Get Started
					</Text>
					<ArrowForwardIcon
						size={20}
						color="#FFFFFF"
					/>
				</Pressable>
			</View>

			<AuthModal
				isVisible={isModalVisible}
				onClose={handleCloseModal}
			/>
		</View>
	);
});

export default WelcomeScreen;
