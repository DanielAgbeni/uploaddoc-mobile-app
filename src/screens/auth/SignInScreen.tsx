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
			{/* Background Gradient */}
			<LinearGradient
				colors={
					colorScheme === 'dark'
						? ['rgba(68, 78, 187, 0.15)', 'transparent']
						: ['rgba(68, 78, 187, 0.08)', 'transparent']
				}
				className="absolute top-0 left-0 right-0 h-96"
			/>

			<ScrollView
				className="flex-1"
				contentContainerClassName="flex-grow"
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled">
				<MainContainer className="flex-1 px-6 pt-16 pb-8">
					{/* Hero Section */}
					<View className="mb-10">
						<CustomImage
							source={require('../../assets/app-images/icon.png')}
							className="w-16 h-16 rounded-2xl mb-6"
							contentFit="cover"
						/>
						<Text className="text-4xl font-bold text-foreground mb-3">
							Welcome Back
						</Text>
						<Text className="text-lg text-muted-foreground">
							Sign in to continue to your account
						</Text>
					</View>

					{/* Form Container */}
					<View className="flex-1">
						{/* Email Field */}
						<FormInput
							name="email"
							control={control}
							label="Email Address"
							placeholder="Enter your email"
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
						<View className="mb-3">
							<View className="flex-row justify-between items-center mb-2">
								<Text className="text-foreground font-semibold text-base">
									Password
								</Text>
								<Pressable
									onPress={() => navigation.navigate('ForgotPassword')}
									disabled={loginMutation.isPending}
									className="active:opacity-70">
									<Text className="text-primary font-medium text-sm">
										Forgot?
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
							icon="log-in-outline"
							className="mt-8"
						/>

						{/* Divider */}
						<View className="flex-row items-center my-8">
							<View className="flex-1 h-px bg-border" />
							<Text className="px-4 text-muted-foreground text-sm">
								or continue with
							</Text>
							<View className="flex-1 h-px bg-border" />
						</View>

						{/* Social Login Buttons (Placeholder) */}
						<View className="flex-row gap-4 mb-8">
							<Pressable
								className="flex-1 flex-row items-center justify-center border border-border rounded-xl py-4 bg-card active:opacity-70"
								style={({ pressed }) => ({
									transform: [{ scale: pressed ? 0.98 : 1 }],
								})}>
								<Icon
									name="logo-google"
									size={20}
									color="#EA4335"
								/>
								<Text className="text-foreground font-medium ml-2">Google</Text>
							</Pressable>
							<Pressable
								className="flex-1 flex-row items-center justify-center border border-border rounded-xl py-4 bg-card active:opacity-70"
								style={({ pressed }) => ({
									transform: [{ scale: pressed ? 0.98 : 1 }],
								})}>
								<Icon
									name="logo-apple"
									size={20}
									color={colorScheme === 'dark' ? '#fff' : '#000'}
								/>
								<Text className="text-foreground font-medium ml-2">Apple</Text>
							</Pressable>
						</View>

						{/* Sign Up Section */}
						<View className="items-center pb-4">
							<Text className="text-muted-foreground text-base mb-4">
								Don't have an account?
							</Text>
							<AuthButton
								title="Create Account"
								onPress={() => navigation.navigate('SignUp')}
								variant="outline"
								icon="person-add-outline"
								disabled={loginMutation.isPending}
							/>
						</View>
					</View>
				</MainContainer>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
