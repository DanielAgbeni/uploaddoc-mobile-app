import React from 'react';
import {
	View,
	Text,
	Pressable,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
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
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../providers/ThemeProvider';
import GoogleIcon from 'src/assets/icons/google.icon';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

type SignInFormData = {
	email: string;
	password: string;
};

export default function SignInScreen({ navigation }: Props) {
	const loginMutation = useLoginMutation();
	const { colorScheme } = useTheme();

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

	const onSubmit = (data: SignInFormData) => {
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
					const errorMessage =
						error.response?.data?.message ||
						error.response?.data?.errors?.email ||
						error.response?.data?.errors?.password ||
						'Failed to sign in. Please try again.';

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
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className="flex-1 bg-background">
			{/* Enhanced Background Gradient */}
			<LinearGradient
				colors={
					colorScheme === 'dark'
						? [
								'rgba(68, 78, 187, 0.2)',
								'rgba(68, 78, 187, 0.05)',
								'transparent',
							]
						: [
								'rgba(68, 78, 187, 0.12)',
								'rgba(68, 78, 187, 0.04)',
								'transparent',
							]
				}
				className="absolute top-0 left-0 right-0 h-[500px]"
			/>

			<ScrollView
				className="flex-1"
				contentContainerClassName="flex-grow"
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled">
				<MainContainer className="flex-1 px-6 pt-20 pb-8">
					{/* Hero Section with Enhanced Spacing */}
					<View className="mb-12">
						<View className="mb-8">
							<CustomImage
								source={require('../../assets/app-images/icon.png')}
								className="w-20 h-20 rounded-3xl shadow-lg"
								contentFit="cover"
							/>
						</View>
						<Text className="text-[40px] font-bold text-foreground mb-2 leading-tight">
							Welcome Back
						</Text>
						<Text className="text-base text-muted-foreground leading-relaxed">
							Sign in to continue your journey
						</Text>
					</View>

					{/* Form Card */}
					<View className="flex-1">
						{/* Social Login Section - Moved to Top */}
						<Pressable
							className="flex-row items-center justify-center border-2 border-border rounded-2xl py-4 mb-8 bg-card active:bg-muted"
							style={({ pressed }) => ({
								transform: [{ scale: pressed ? 0.98 : 1 }],
							})}
							disabled={loginMutation.isPending}>
							<GoogleIcon />
							<Text className="text-foreground font-semibold ml-3 text-base">
								Continue with Google
							</Text>
						</Pressable>

						{/* Divider */}
						<View className="flex-row items-center mb-8">
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
							rules={{
								required: 'Email is required',
								pattern: {
									value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
									message: 'Please enter a valid email address',
								},
							}}
						/>

						{/* Password Field */}
						<View className="mb-6">
							<View className="flex-row justify-between items-center mb-2">
								<Text className="text-foreground font-semibold text-base">
									Password
								</Text>
								<Pressable
									onPress={() => navigation.navigate('ForgotPassword')}
									disabled={loginMutation.isPending}
									className="active:opacity-70 py-1">
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
							className="mb-8"
						/>

						{/* Sign Up Section - Enhanced */}
						<View className="items-center pt-4 pb-4">
							<View className="flex-row items-center mb-4">
								<Text className="text-muted-foreground text-base mr-2">
									Don't have an account?
								</Text>
								<Pressable
									onPress={() => navigation.navigate('SignUp')}
									disabled={loginMutation.isPending}
									className="active:opacity-70 py-1">
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
