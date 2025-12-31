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
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../providers/ThemeProvider';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

type ForgotPasswordFormData = {
	email: string;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
	const { colorScheme } = useTheme();
	const [sent, setSent] = useState(false);
	const [loading, setLoading] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
		getValues,
	} = useForm<ForgotPasswordFormData>({
		defaultValues: {
			email: '',
		},
	});

	const onSubmit = async (data: ForgotPasswordFormData) => {
		// TODO: Implement password reset logic with API
		setLoading(true);
		try {
			console.log('Reset password for:', data.email);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));
			setSent(true);
		} catch (error) {
			console.error('Reset password error:', error);
		} finally {
			setLoading(false);
		}
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
				<MainContainer className="flex-1 px-6 pt-16 pb-8 justify-center">
					{!sent ? (
						<>
							{/* Hero Section */}
							<View className="mb-10">
								<View className="mb-6">
									<View className="bg-primary/10 w-20 h-20 rounded-2xl items-center justify-center">
										<Icon
											name="key-outline"
											size={40}
											color="#444ebb"
										/>
									</View>
								</View>
								<Text className="text-4xl font-bold text-foreground mb-3">
									Forgot Password?
								</Text>
								<Text className="text-lg text-muted-foreground leading-6">
									No worries! Enter your email and we'll send you reset
									instructions.
								</Text>
							</View>

							{/* Form Container */}
							<View>
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

								{/* Submit Button */}
								<AuthButton
									title="Send Reset Link"
									onPress={handleSubmit(onSubmit)}
									loading={loading}
									icon="send-outline"
									className="mb-6"
								/>

								{/* Back to Sign In */}
								<Pressable
									onPress={() => navigation.navigate('SignIn')}
									className="items-center py-4 active:opacity-70">
									<View className="flex-row items-center">
										<Icon
											name="arrow-back-outline"
											size={18}
											color="#444ebb"
											style={{ marginRight: 6 }}
										/>
										<Text className="text-primary font-semibold text-base">
											Back to Sign In
										</Text>
									</View>
								</Pressable>
							</View>
						</>
					) : (
						<>
							{/* Success State */}
							<View className="items-center">
								{/* Success Icon */}
								<View className="mb-8">
									<View className="bg-primary/10 w-32 h-32 rounded-full items-center justify-center">
										<View className="bg-primary w-24 h-24 rounded-full items-center justify-center">
											<Icon
												name="checkmark"
												size={48}
												color="#fff"
											/>
										</View>
									</View>
								</View>

								{/* Success Message */}
								<Text className="text-3xl font-bold text-foreground mb-4 text-center">
									Check Your Email
								</Text>
								<Text className="text-lg text-muted-foreground text-center mb-2 px-4 leading-6">
									We've sent password reset instructions to
								</Text>
								<Text className="text-lg font-semibold text-foreground mb-8 text-center">
									{getValues('email')}
								</Text>

								{/* Additional Info */}
								<View className="bg-card/50 border border-border rounded-xl p-4 mb-8 w-full">
									<View className="flex-row items-start">
										<Icon
											name="information-circle-outline"
											size={20}
											color="#444ebb"
											style={{ marginRight: 8, marginTop: 2 }}
										/>
										<Text className="flex-1 text-muted-foreground text-sm leading-5">
											Didn't receive the email? Check your spam folder or{' '}
											<Text
												className="text-primary font-medium"
												onPress={() => setSent(false)}>
												try again
											</Text>
										</Text>
									</View>
								</View>

								{/* Action Buttons */}
								<View className="w-full gap-4">
									<AuthButton
										title="Open Email App"
										onPress={() => {
											// TODO: Open email app
											console.log('Open email app');
										}}
										icon="mail-open-outline"
									/>

									<AuthButton
										title="Back to Sign In"
										onPress={() => navigation.navigate('SignIn')}
										variant="outline"
										icon="arrow-back-outline"
									/>
								</View>
							</View>
						</>
					)}
				</MainContainer>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
