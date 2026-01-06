import React, { memo, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import CustomImage from '../../components/common/CustomImage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../providers/ThemeProvider';
import { MoonIcon, SunIcon } from 'src/assets/icons';
import Animated, {
	FadeInDown,
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import GoogleIcon from 'src/assets/icons/google.icon';
import MaskedView from '@react-native-masked-view/masked-view';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const WelcomeScreen = memo(function WelcomeScreen({ navigation }: Props) {
	const { colorScheme, theme, setTheme, colors } = useTheme();
	const insets = useSafeAreaInsets();

	// Floating animation for the icon/logo
	const translateY = useSharedValue(0);

	useEffect(() => {
		translateY.value = withRepeat(
			withSequence(
				withTiming(-12, { duration: 2000 }),
				withTiming(0, { duration: 2000 }),
			),
			-1,
			true,
		);
	}, []);

	const logoStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	const getThemeIcon = () => {
		const iconColor = colors.foreground;
		if (theme === 'light')
			return (
				<SunIcon
					size={20}
					color={iconColor}
				/>
			);
		if (theme === 'dark')
			return (
				<MoonIcon
					size={20}
					color={iconColor}
				/>
			);
		return (
			<SunIcon
				size={20}
				color={iconColor}
			/>
		);
	};

	const cycleTheme = () => {
		if (theme === 'system') setTheme('light');
		else if (theme === 'light') setTheme('dark');
		else setTheme('system');
	};

	return (
		<View className="flex-1 bg-background">
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

			{/* Top Progress Bar */}
			<View
				className="bg-primary/90"
				style={{
					height: 4,
					marginTop: insets.top,
					width: '100%',
				}}
			/>

			{/* Subtle gradient overlay */}
			<LinearGradient
				colors={
					colorScheme === 'dark'
						? ['transparent', `${colors.primary}15`, 'transparent']
						: ['transparent', `${colors.primary}08`, 'transparent']
				}
				className="absolute inset-0"
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
			/>

			{/* Top Bar - Theme Toggle */}
			<Animated.View
				entering={FadeInUp.delay(200).springify()}
				style={{ paddingTop: 16 }}
				className="flex-row justify-end px-5 z-10">
				<Pressable
					onPress={cycleTheme}
					className="w-9 h-9 rounded-full bg-card/80 backdrop-blur border border-border/40 items-center justify-center active:bg-muted">
					{getThemeIcon()}
				</Pressable>
			</Animated.View>

			{/* Main Content */}
			<View className="flex-1 justify-center items-center px-6 -mt-8">
				{/* App Icon/Logo with rounded gradient container */}
				<Animated.View
					entering={FadeInDown.delay(300).springify()}
					style={logoStyle}
					className="mb-16">
					<View className="bg-background rounded-[60px] overflow-hidden">
						<CustomImage
							source={require('../../assets/app-images/icon.png')}
							className="w-48 h-48"
							contentFit="contain"
						/>
					</View>
				</Animated.View>

				{/* Headline with gradient text */}
				<Animated.View
					entering={FadeInDown.delay(500).springify()}
					className="items-center mb-16 px-4">
					{/* Gradient "UploadDoc:" text */}
					<MaskedView
						maskElement={
							<Text
								className="font-black text-center"
								style={{ fontSize: 38, letterSpacing: -0.5 }}>
								UploadDoc:
							</Text>
						}>
						<LinearGradient
							colors={[colors.gradientStart, colors.gradientEnd]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}>
							<Text
								className="font-black text-center opacity-0"
								style={{ fontSize: 38, letterSpacing: -0.5 }}>
								UploadDoc:
							</Text>
						</LinearGradient>
					</MaskedView>
					<Text
						className="text-foreground font-black text-center leading-tight"
						style={{ fontSize: 38, letterSpacing: -0.5 }}>
						Document management, simplified
					</Text>
				</Animated.View>

				{/* Action Buttons */}
				<Animated.View
					entering={FadeInDown.delay(700).springify()}
					className="w-full max-w-md gap-3.5 px-6"
					style={{ paddingBottom: insets.bottom + 24 }}>
					{/* Log in Button */}
					<AnimatedPressable
						onPress={() => navigation.navigate('SignIn')}
						className="rounded-full py-4 px-8 active:opacity-90 bg-primary"
						style={({ pressed }) => ({
							transform: [{ scale: pressed ? 0.97 : 1 }],
						})}>
						<Text
							className="font-bold text-center text-lg"
							style={{ color: colors.primaryForeground }}>
							Log in
						</Text>
					</AnimatedPressable>

					{/* Register Button */}
					<AnimatedPressable
						onPress={() => navigation.navigate('SignUp')}
						className="rounded-full py-4 px-8 active:opacity-90 bg-primary"
						style={({ pressed }) => ({
							transform: [{ scale: pressed ? 0.97 : 1 }],
						})}>
						<Text
							className="font-bold text-center text-lg"
							style={{ color: colors.primaryForeground }}>
							Register
						</Text>
					</AnimatedPressable>

					{/* Sign in with Google */}
					<AnimatedPressable
						onPress={() => {
							// Handle Google Sign In
						}}
						className="rounded-full py-4 px-8 bg-accent-foreground active:opacity-80 flex-row items-center justify-center gap-3"
						style={({ pressed }) => ({
							transform: [{ scale: pressed ? 0.97 : 1 }],
						})}>
						<View className="w-5 h-5 rounded-full items-center justify-center">
							<GoogleIcon size={20} />
						</View>
						<Text className="text-white dark:text-black font-semibold text-center text-base">
							Sign in with Google
						</Text>
					</AnimatedPressable>
				</Animated.View>
			</View>
		</View>
	);
});

export default WelcomeScreen;
