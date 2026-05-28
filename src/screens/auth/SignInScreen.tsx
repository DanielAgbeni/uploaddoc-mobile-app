import React, { memo, useCallback, useEffect, useState } from 'react';
import {
	View,
	Text,
	Pressable,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import { useLoginMutation } from '../../hooks/useLoginMutation';
import { showMessage } from 'react-native-flash-message';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { MainContainer } from 'src/shared/components';
import CustomImage from '../../components/common/CustomImage';
import FormInput from '../../components/auth/FormInput';
import AuthButton from '../../components/auth/AuthButton';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../providers/ThemeProvider';
import GoogleIcon from 'src/assets/icons/google.icon';
import {
	GoogleSignin,
	isErrorWithCode,
	statusCodes,
} from '@react-native-google-signin/google-signin';
import { googleLogin } from '../../api/auth';
import { useUserStore } from '../../shared/user-store/useUserStore';
import { getErrorMessage } from '../../utils/error-handling';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

type SignInFormData = {
	email: string;
	password: string;
};

function SignInScreen({ navigation }: Props) {
	const loginMutation = useLoginMutation();
	const setLoginData = useUserStore((state) => state.setLoginData);
	const { colorScheme, colors } = useTheme();
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	useEffect(() => {
		GoogleSignin.configure({
			webClientId:
				'711385990812-5r58ssnajdajr8ot33ncpnn131kqj5q4.apps.googleusercontent.com',
		});
	}, []);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInFormData>({
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = useCallback(
		(data: SignInFormData) => {
			loginMutation.mutate(
				{ email: data.email.trim(), password: data.password.trim() },
				{
					onSuccess: (response) => {
						showMessage({
							message: 'Login Successful',
							description: `Welcome back, ${response.data.data.user.name}!`,
							type: 'success',
							duration: 3000,
							icon: 'success',
						});
					},
					onError: (error: AxiosError<ErrorResponseType>) => {
						const errorMessage = getErrorMessage(error);

						showMessage({
							message: 'Login Failed',
							description: errorMessage,
							type: 'danger',
							duration: 4000,
							icon: 'danger',
						});
					},
				},
			);
		},
		[loginMutation],
	);

	const handleGoogleSignIn = useCallback(async () => {
		setIsGoogleLoading(true);
		try {
			await GoogleSignin.hasPlayServices();
			await GoogleSignin.signOut().catch(() => undefined);
			const result = await GoogleSignin.signIn();
			const userInfo = (
				result as { data?: { idToken?: string }; idToken?: string }
			).data
				? (result as { data: { idToken?: string } }).data
				: (result as { idToken?: string });
			const isCancelled = (result as { type?: string }).type === 'cancelled';

			if (isCancelled) {
				return;
			}

			const idToken = userInfo?.idToken;

			if (!idToken) {
				throw new Error('No ID Token obtained from Google');
			}

			const response = await googleLogin(idToken);

			if (!response.data.success) {
				throw new Error(response.data.message || 'Google Login Failed');
			}

			showMessage({
				message: 'Login Successful',
				description: 'Welcome back!',
				type: 'success',
			});
			setLoginData(response.data.data);
		} catch (error: unknown) {
			let errorMessage = 'Google login failed';
			let cancelled = false;

			if (isErrorWithCode(error)) {
				switch (error.code) {
					case statusCodes.SIGN_IN_CANCELLED:
						cancelled = true;
						break;
					case statusCodes.IN_PROGRESS:
						errorMessage = 'Sign in in progress';
						break;
					case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
						errorMessage = 'Play services not available';
						break;
					default:
						errorMessage = error.message || 'Something went wrong';
				}
			} else {
				errorMessage = getErrorMessage(error);
			}

			if (!cancelled) {
				showMessage({
					message: 'Login Failed',
					description: errorMessage,
					type: 'danger',
				});
			}
		} finally {
			setIsGoogleLoading(false);
		}
	}, [setLoginData]);

	const handleNavigateToForgotPassword = useCallback(() => {
		navigation.navigate('ForgotPassword');
	}, [navigation]);

	const handleNavigateToSignUp = useCallback(() => {
		navigation.navigate('SignUp');
	}, [navigation]);

	const isInteractionDisabled = loginMutation.isPending || isGoogleLoading;

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className="flex-1 bg-background">
			{/* Enhanced Background Gradient */}
			<LinearGradient
				colors={
					colorScheme === 'dark'
						? [
								'rgba(68, 78, 187, 0.15)',
								'rgba(0, 9, 20, 0)',
							]
						: [
								'rgba(68, 78, 187, 0.08)',
								'rgba(235, 244, 255, 0)',
							]
				}
				className="absolute top-0 left-0 right-0 h-[400px]"
			/>

			<ScrollView
				className="flex-1"
				contentContainerClassName="flex-grow"
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled">
				<MainContainer className="flex-1 px-6 pt-16 pb-8">
					
					{/* Hero Section */}
					<View className="mb-10 mt-4">
						<View className="mb-6">
							<CustomImage
								source={require('../../assets/app-images/icon.png')}
								className="w-16 h-16 rounded-[20px] shadow-md border border-border"
								contentFit="cover"
							/>
						</View>
						<Text className="text-4xl font-extrabold text-foreground mb-2 leading-tight tracking-tight">
							Welcome Back
						</Text>
						<Text className="text-base text-muted-foreground leading-relaxed">
							Sign in to continue your document workflow.
						</Text>
					</View>

					{/* Form Card */}
					<View className="flex-1">
						
						{/* Social Login Button */}
						<Pressable
							onPress={handleGoogleSignIn}
							className="flex-row items-center justify-center border border-border rounded-2xl py-4 mb-6 bg-card active:opacity-90 shadow-sm"
							style={({ pressed }) => ({
								transform: [{ scale: pressed && !isInteractionDisabled ? 0.98 : 1 }],
							})}
							disabled={isInteractionDisabled}>
							{isGoogleLoading ? (
								<ActivityIndicator
									size="small"
									color={colors.primary}
								/>
							) : (
								<GoogleIcon />
							)}
							<Text className="text-foreground font-semibold ml-3 text-base">
								Continue with Google
							</Text>
						</Pressable>

						{/* Divider */}
						<View className="flex-row items-center mb-6">
							<View className="flex-1 h-px bg-border" />
							<Text className="px-4 text-muted-foreground text-sm font-medium">
								Or sign in with email
							</Text>
							<View className="flex-1 h-px bg-border" />
						</View>

						{/* Email Field */}
						<FormInput
							name="email"
							control={control}
							label="Email Address"
							placeholder="you@example.com"
							icon="mail-outline"
							keyboardType="email-address"
							autoCapitalize="none"
							autoComplete="email"
							error={errors.email?.message}
							editable={!isInteractionDisabled}
							rules={{
								required: 'Email is required',
								pattern: {
									value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
									message: 'Please enter a valid email address',
								},
							}}
						/>

						{/* Password Field */}
						<View className="mb-8">
							<View className="flex-row justify-between items-center mb-2">
								<Text className="text-foreground font-semibold text-base">
									Password
								</Text>
								<Pressable
									onPress={handleNavigateToForgotPassword}
									disabled={isInteractionDisabled}
									className="active:opacity-75 py-1">
									<Text className="text-primary font-semibold text-sm">
										Forgot Password?
									</Text>
								</Pressable>
							</View>
							<FormInput
								name="password"
								control={control}
								label=""
								placeholder="Enter your password"
								icon="lock-closed-outline"
								secureTextEntry
								autoComplete="password"
								error={errors.password?.message}
								editable={!isInteractionDisabled}
								rules={{
									required: 'Password is required',
									minLength: {
										value: 6,
										message: 'Password must be at least 6 characters',
									},
								}}
								containerClassName="mb-0"
							/>
						</View>

						{/* Submit Button */}
						<AuthButton
							title="Sign In"
							onPress={handleSubmit(onSubmit)}
							loading={loginMutation.isPending}
							disabled={isInteractionDisabled}
							className="mb-8"
						/>

						{/* Sign Up Navigation */}
						<View className="items-center pt-2 pb-4">
							<View className="flex-row items-center">
								<Text className="text-muted-foreground text-base mr-2">
									Don't have an account?
								</Text>
								<Pressable
									onPress={handleNavigateToSignUp}
									disabled={isInteractionDisabled}
									className="active:opacity-75 py-1">
									<Text className="text-primary font-bold text-base">
										Sign Up
									</Text>
								</Pressable>
							</View>
						</View>
					</View>
				</MainContainer>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

export default memo(SignInScreen);
