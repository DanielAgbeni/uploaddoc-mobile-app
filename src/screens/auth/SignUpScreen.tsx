import React, { useState } from 'react';
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
import { useForm } from 'react-hook-form';
import { MainContainer } from 'src/shared/components';
import CustomImage from '../../components/common/CustomImage';
import FormInput from '../../components/auth/FormInput';
import AuthButton from '../../components/auth/AuthButton';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../providers/ThemeProvider';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

type SignUpFormData = {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
};

export default function SignUpScreen({ navigation }: Props) {
	const { colorScheme } = useTheme();

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<SignUpFormData>({
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const password = watch('password');

	const onSubmit = async (data: SignUpFormData) => {
		// TODO: Implement sign up logic with API
		console.log('Sign up:', data);
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
							Create Account
						</Text>
						<Text className="text-lg text-muted-foreground">
							Sign up to get started with UploadDoc
						</Text>
					</View>

					{/* Form Container */}
					<View className="flex-1">
						{/* Name Field */}
						<FormInput
							name="name"
							control={control}
							label="Full Name"
							placeholder="Enter your full name"
							icon="person-outline"
							autoCapitalize="words"
							autoComplete="name"
							error={errors.name?.message}
							rules={{
								required: 'Full name is required',
								minLength: {
									value: 2,
									message: 'Name must be at least 2 characters',
								},
							}}
						/>

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

						{/* Password Field with Strength Indicator */}
						<View className="mb-5">
							<FormInput
								name="password"
								control={control}
								label="Password"
								placeholder="Create a strong password"
								icon="lock-closed-outline"
								secureTextEntry
								autoComplete="password-new"
								error={errors.password?.message}
								rules={{
									required: 'Password is required',
									minLength: {
										value: 8,
										message: 'Password must be at least 8 characters',
									},
								}}
								containerClassName="mb-0"
							/>
							<PasswordStrengthIndicator password={password || ''} />
						</View>

						{/* Confirm Password Field */}
						<FormInput
							name="confirmPassword"
							control={control}
							label="Confirm Password"
							placeholder="Re-enter your password"
							icon="lock-closed-outline"
							secureTextEntry
							autoComplete="password-new"
							error={errors.confirmPassword?.message}
							rules={{
								required: 'Please confirm your password',
								validate: (value: string) =>
									value === password || 'Passwords do not match',
							}}
						/>

						{/* Terms and Conditions */}
						<View className="bg-card/50 border border-border rounded-xl p-4 mb-6">
							<View className="flex-row items-start">
								<Icon
									name="information-circle-outline"
									size={20}
									color="#444ebb"
									style={{ marginRight: 8, marginTop: 2 }}
								/>
								<Text className="flex-1 text-muted-foreground text-sm leading-5">
									By signing up, you agree to our{' '}
									<Text className="text-primary font-medium">
										Terms of Service
									</Text>{' '}
									and{' '}
									<Text className="text-primary font-medium">
										Privacy Policy
									</Text>
								</Text>
							</View>
						</View>

						{/* Submit Button */}
						<AuthButton
							title="Create Account"
							onPress={handleSubmit(onSubmit)}
							icon="person-add-outline"
							className="mb-6"
						/>

						{/* Divider */}
						<View className="flex-row items-center my-6">
							<View className="flex-1 h-px bg-border" />
							<Text className="px-4 text-muted-foreground text-sm">
								or sign up with
							</Text>
							<View className="flex-1 h-px bg-border" />
						</View>

						{/* Social Sign Up Buttons */}
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

						{/* Sign In Section */}
						<View className="items-center pb-4">
							<View className="flex-row items-center">
								<Text className="text-muted-foreground text-base">
									Already have an account?{' '}
								</Text>
								<Pressable
									onPress={() => navigation.navigate('SignIn')}
									className="active:opacity-70">
									<Text className="text-primary font-semibold text-base">
										Sign In
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
