import React, { useState, useCallback } from 'react';
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
import { MainContainer } from 'src/shared/components';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../providers/ThemeProvider';
import { forgetpassword, resetPassword } from '../../api/auth';
import { showMessage } from 'react-native-flash-message';
import RequestOtpForm from '../../components/auth/forgot-password/RequestOtpForm';
import ResetPasswordForm from '../../components/auth/forgot-password/ResetPasswordForm';
import { CustomImage } from 'src/components';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
	const { colorScheme } = useTheme();
	const [step, setStep] = useState<1 | 2>(1);
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const onRequestOtp = useCallback(async (data: { email: string }) => {
		setIsLoading(true);
		try {
			const response = await forgetpassword(data.email);
			if (response.data.success) {
				setEmail(data.email);
				setStep(2);
				showMessage({
					message: 'OTP Sent',
					description: response.data.message || 'Check your email for the OTP.',
					type: 'success',
				});
			} else {
				showMessage({
					message: 'Failed',
					description: response.data.message,
					type: 'danger',
				});
			}
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message ||
				error.message ||
				'An unexpected error occurred.';
			showMessage({
				message: 'Request failed',
				description: errorMessage,
				type: 'danger',
			});
		} finally {
			setIsLoading(false);
		}
	}, []);

	const onResetPassword = useCallback(
		async (data: { otp: string; newPassword: string }) => {
			setIsLoading(true);
			try {
				const payload: ResetPasswordPayloadType = {
					email: email,
					otp: data.otp,
					newPassword: data.newPassword,
				};

				const response = await resetPassword(payload);

				if (response.data.success) {
					showMessage({
						message: 'Password Reset Successful',
						description: 'You can now login with your new password.',
						type: 'success',
					});
					navigation.navigate('SignIn');
				} else {
					showMessage({
						message: 'Reset Failed',
						description: response.data.message,
						type: 'danger',
					});
				}
			} catch (error: any) {
				const errorMessage =
					error.response?.data?.message ||
					error.message ||
					'An unexpected error occurred.';
				showMessage({
					message: 'Reset failed',
					description: errorMessage,
					type: 'danger',
				});
			} finally {
				setIsLoading(false);
			}
		},
		[email, navigation],
	);

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
				<MainContainer
					scrollable={false}
					className="flex-1 px-6 pt-16 pb-8 justify-center">
					{/* Hero Section */}
					<View className="mb-10">
						<View className="mb-6">
							<View className="mb-8">
								<CustomImage
									source={require('../../assets/app-images/icon.png')}
									className="w-20 h-20 rounded-3xl shadow-lg"
									contentFit="cover"
								/>
							</View>
						</View>
						<Text className="text-4xl font-bold text-foreground mb-3">
							{step === 1 ? 'Forgot Password?' : 'Reset Password'}
						</Text>
						<Text className="text-lg text-muted-foreground leading-6">
							{step === 1
								? "No worries! Enter your email and we'll send you reset instructions."
								: `Enter the OTP sent to ${email} and your new password.`}
						</Text>
					</View>

					{step === 1 ? (
						<RequestOtpForm
							onSubmit={onRequestOtp}
							isLoading={isLoading}
						/>
					) : (
						<ResetPasswordForm
							onSubmit={onResetPassword}
							isLoading={isLoading}
						/>
					)}

					{/* Back to Sign In */}
					<Pressable
						onPress={() => navigation.navigate('SignIn')}
						className="items-center py-4 active:opacity-70">
						<View className="flex-row items-center">
							<Text className="text-primary font-semibold text-base">
								Back to Sign In
							</Text>
						</View>
					</Pressable>
				</MainContainer>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
