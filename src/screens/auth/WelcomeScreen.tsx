import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../providers/ThemeProvider';
import { AuthStackParamList } from '../../types/navigation.types';
import { ArrowForwardIcon, icon } from '../../assets/icons';
import AuthButton from '../../components/auth/AuthButton';
import CustomImage from '../../components/common/CustomImage';
import {
	UploadIllustration,
	ConnectIllustration,
	TrackIllustration,
} from '../../components/auth/OnboardingIllustrations';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const WelcomeScreen = memo(function WelcomeScreen({ navigation }: Props) {
	const insets = useSafeAreaInsets();
	const { colors, colorScheme } = useTheme();
	const pagerRef = useRef<PagerView>(null);
	const [activePage, setActivePage] = useState(0);

	const slides = useMemo(() => [
		{
			title: 'Upload Your Document',
			description: 'Submit PDFs, images, Word files, presentations, spreadsheets, and more directly from your phone.',
			illustration: <UploadIllustration />,
		},
		{
			title: 'Connect with Receivers',
			description: 'Find document receivers—lecturers, academic departments, print shops, business centers, offices, HR teams, event coordinators, and schools.',
			illustration: <ConnectIllustration />,
		},
		{
			title: 'Track Submission Workflow',
			description: 'Follow your documents in real-time. Know exactly when they are pending, accepted, or rejected by the receiver.',
			illustration: <TrackIllustration />,
		},
	], []);

	const contentPaddingBottom = useMemo(
		() => Math.max(insets.bottom, 20),
		[insets.bottom],
	);

	const handlePageSelected = useCallback((e: any) => {
		setActivePage(e.nativeEvent.position);
	}, []);

	const handleNext = useCallback(() => {
		if (activePage < slides.length - 1) {
			pagerRef.current?.setPage(activePage + 1);
		}
	}, [activePage, slides.length]);

	const handleSkip = useCallback(() => {
		pagerRef.current?.setPage(slides.length - 1);
	}, [slides.length]);

	const handleSignIn = useCallback(() => {
		navigation.navigate('SignIn');
	}, [navigation]);

	const handleSignUp = useCallback(() => {
		navigation.navigate('SignUp');
	}, [navigation]);

	return (
		<View className="flex-1 bg-background">
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

			{/* Header with Skip button */}
			<View
				className="flex-row items-center justify-between px-6 pt-4"
				style={{ marginTop: insets.top }}>
				<View className="flex-row items-center gap-2">
					<CustomImage
						source={icon}
						className="w-8 h-8 rounded-lg"
						contentFit="cover"
					/>
					<Text className="text-2xl font-black tracking-tight text-primary">
						UploadDoc
					</Text>
				</View>
				{activePage < slides.length - 1 ? (
					<Pressable
						onPress={handleSkip}
						className="px-4 py-2 rounded-full bg-primary active:opacity-80">
						<Text className="text-sm font-semibold text-white">
							Skip
						</Text>
					</Pressable>
				) : null}
			</View>

			{/* Swipable Carousel */}
			<PagerView
				ref={pagerRef}
				style={{ flex: 1 }}
				initialPage={0}
				onPageSelected={handlePageSelected}>
				{slides.map((slide, index) => (
					<View
						key={index}
						className="flex-1 items-center justify-center px-6">
						<Animated.View
							entering={FadeInDown.duration(600).delay(100)}
							className="items-center justify-center mb-8 h-[300px] w-full">
							{slide.illustration}
						</Animated.View>

						<Animated.Text
							entering={FadeInDown.duration(600).delay(200)}
							className="text-3xl font-extrabold text-center text-foreground mb-4 px-4 leading-tight">
							{slide.title}
						</Animated.Text>

						<Animated.Text
							entering={FadeInDown.duration(600).delay(300)}
							className="text-base text-center text-muted-foreground px-8 leading-relaxed">
							{slide.description}
						</Animated.Text>
					</View>
				))}
			</PagerView>

			{/* Footer Actions */}
			<View
				className="px-6 pt-4 pb-6"
				style={{ paddingBottom: contentPaddingBottom }}>
				
				{/* Dots Indicator */}
				<View className="flex-row justify-center items-center gap-2 mb-8">
					{slides.map((_, index) => (
						<View
							key={index}
							className={`h-2.5 rounded-full transition-all duration-300 ${
								activePage === index ? 'w-6 bg-primary' : 'w-2.5 bg-border'
							}`}
						/>
					))}
				</View>

				{/* Primary actions based on active slide */}
				<Animated.View entering={FadeInUp.duration(400)}>
					{activePage < slides.length - 1 ? (
						<Pressable
							onPress={handleNext}
							className="flex-row items-center justify-center rounded-2xl py-4 bg-primary active:opacity-95 shadow-lg"
							style={{ shadowColor: colors.primary }}>
							<Text className="mr-2 text-lg font-bold text-white">
								Next
							</Text>
							<ArrowForwardIcon
								size={18}
								color="#FFFFFF"
							/>
						</Pressable>
					) : (
						<View className="w-full gap-4">
							<AuthButton
								title="Sign In"
								onPress={handleSignIn}
							/>
							<AuthButton
								title="Create Account"
								variant="outline"
								onPress={handleSignUp}
							/>
						</View>
					)}
				</Animated.View>
			</View>
		</View>
	);
});

export default WelcomeScreen;
