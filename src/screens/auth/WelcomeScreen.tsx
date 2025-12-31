import React, { useEffect } from 'react';
import { View, Text, Pressable, StatusBar as RNStatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import CustomImage from '../../components/common/CustomImage';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../providers/ThemeProvider';
import LoginIcon from 'src/assets/icons/login.icon';
import {
	ShieldIcon,
	MoonIcon,
	SunIcon,
	ArrowForwardIcon,
} from 'src/assets/icons'; // Using index export for new ones to test it
import Animated, {
	FadeInDown,
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WelcomeScreen({ navigation }: Props) {
	const { colorScheme, theme, setTheme, toggleTheme } = useTheme();
	const insets = useSafeAreaInsets();

	// Floating animation for the logo
	const translateY = useSharedValue(0);

	useEffect(() => {
		translateY.value = withRepeat(
			withSequence(
				withTiming(-10, { duration: 1500 }),
				withTiming(0, { duration: 1500 }),
			),
			-1,
			true,
		);
	}, []);

	const logoStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: translateY.value }],
		};
	});

	const getThemeIcon = () => {
		if (theme === 'light')
			return (
				<SunIcon
					size={20}
					color={colorScheme === 'dark' ? '#fff' : '#000'}
				/>
			);
		if (theme === 'dark')
			return (
				<MoonIcon
					size={20}
					color={colorScheme === 'dark' ? '#fff' : '#000'}
				/>
			);
		return (
			<SunIcon
				size={20}
				color={colorScheme === 'dark' ? '#fff' : '#000'}
			/>
		); // Fallback/System
	};

	const cycleTheme = () => {
		if (theme === 'system') setTheme('light');
		else if (theme === 'light') setTheme('dark');
		else setTheme('system');
	};

	return (
		<View className="flex-1 bg-background">
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

			{/* Dynamic Background Gradient */}
			<LinearGradient
				colors={
					colorScheme === 'dark'
						? ['rgba(68, 78, 187, 0.2)', 'transparent', 'transparent']
						: [
								'rgba(68, 78, 187, 0.1)',
								'rgba(68, 78, 187, 0.05)',
								'transparent',
							]
				}
				className="absolute inset-0"
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
			/>

			{/* Top Bar with Theme Toggle */}
			<Animated.View
				entering={FadeInUp.delay(200).springify()}
				style={{ paddingTop: insets.top + 16 }}
				className="flex-row justify-end px-6 z-10">
				<Pressable
					onPress={cycleTheme}
					className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted">
					{getThemeIcon()}
				</Pressable>
			</Animated.View>

			<View className="flex-1 justify-center items-center px-6">
				{/* Logo/Brand Section */}
				<View className="items-center mb-16 w-full">
					<Animated.View
						entering={FadeInDown.delay(300).springify()}
						style={logoStyle}
						className="mb-8 items-center">
						<View className="shadow-2xl shadow-primary/30">
							<CustomImage
								source={require('../../assets/app-images/icon.png')}
								className="w-40 h-40 rounded-3xl"
								contentFit="cover"
							/>
						</View>
						<View className="absolute -bottom-4 bg-card border border-border rounded-full px-4 py-1.5 flex-row items-center shadow-sm">
							<ShieldIcon
								size={14}
								color="#4F46E5"
							/>
							<Text className="text-foreground text-xs font-semibold ml-1.5">
								Trusted by Pros
							</Text>
						</View>
					</Animated.View>

					<Animated.View
						entering={FadeInDown.delay(400).springify()}
						className="items-center">
						<Text className="text-4xl font-bold text-foreground mb-4 text-center tracking-tight">
							UploadDoc
						</Text>
						<Text className="text-muted-foreground text-center text-lg px-4 leading-7">
							Simplify document submission and{'\n'}management with{' '}
							<Text className="text-primary font-semibold">ease</Text>
						</Text>
					</Animated.View>
				</View>

				{/* Action Buttons */}
				<Animated.View
					entering={FadeInDown.delay(600).springify()}
					className="w-full max-w-sm gap-4 pb-8">
					{/* Primary Sign In Button with Gradient */}
					<AnimatedPressable
						onPress={() => navigation.navigate('SignIn')}
						className="overflow-hidden rounded-2xl shadow-lg shadow-indigo-500/30"
						style={({ pressed }) => ({
							transform: [{ scale: pressed ? 0.98 : 1 }],
						})}>
						<LinearGradient
							colors={['#4F46E5', '#4338CA']} // Indigo-600 to Indigo-700
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							className="py-4 px-6 flex-row items-center justify-center">
							<View className="mr-3 bg-white/20 p-1.5 rounded-lg">
								<LoginIcon
									size={20}
									color="#fff"
								/>
							</View>
							<Text className="text-white font-bold text-lg">Sign In</Text>
						</LinearGradient>
					</AnimatedPressable>

					{/* Secondary Sign Up Button */}
					<AnimatedPressable
						onPress={() => navigation.navigate('SignUp')}
						className="border-2 border-border/60 rounded-2xl py-4 px-6 bg-card active:bg-muted/50"
						style={({ pressed }) => ({
							transform: [{ scale: pressed ? 0.98 : 1 }],
						})}>
						<View className="flex-row items-center justify-center">
							<Text className="text-foreground font-semibold text-lg mr-2">
								Create Account
							</Text>
							<ArrowForwardIcon
								size={18}
								color={colorScheme === 'dark' ? '#fff' : '#000'}
							/>
						</View>
					</AnimatedPressable>
				</Animated.View>
			</View>
		</View>
	);
}
