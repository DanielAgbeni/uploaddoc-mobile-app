import React, { useState, useCallback } from 'react';
import {
	View,
	Text,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import { MainContainer } from 'src/shared/components';
import CustomImage from '../../components/common/CustomImage';
import AuthButton from '../../components/auth/AuthButton';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../providers/ThemeProvider';
import {
	registerUser,
	verifyEmail,
	resendVerificationCode,
} from '../../api/auth';
import { showMessage } from 'react-native-flash-message';
import { useUserStore } from '../../shared/user-store/useUserStore';
import { CustomModal } from '../../components/ui/CustomModal';

// Components
import RegistrationForm from '../../components/auth/sign-up/RegistrationForm';
import OtpVerificationForm from '../../components/auth/sign-up/OtpVerificationForm';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

type SignUpFormData = {
	name: string;
	email: string;
	matricNumber: string;
	password: string;
	confirmPassword: string;
};

type OTPFormData = {
	otp: string;
};

export default function SignUpScreen({ navigation }: Props) {
	const { colorScheme } = useTheme();
	const setLoginData = useUserStore((state) => state.setLoginData);

	const [view, setView] = useState<'register' | 'otp'>('register');
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [canResend, setCanResend] = useState(true);
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

	const onRegister = useCallback(async (data: SignUpFormData) => {
		setIsLoading(true);
		try {
			const { confirmPassword, ...registerData } = data;
			const response = await registerUser(registerData);

			if (response.data.success) {
				showMessage({
					message: 'Registration Successful',
					description: response.data.message,
					type: 'success',
				});
				setEmail(response.data.data.email);
				setCanResend(response.data.data.canResend);
				setView('otp');
			} else {
				if (
					response.data.message ===
					'Email verification already pending. Please check your email or request a new code.'
				) {
					showMessage({
						message: 'Info',
						description: response.data.message,
						type: 'info',
					});
					setEmail(data.email);
					setView('otp');
				} else {
					showMessage({
						message: 'Registration Failed',
						description: response.data.message || 'Registration failed',
						type: 'danger',
					});
				}
			}
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message || 'An unexpected error occurred';

			if (
				errorMessage ===
				'Email verification already pending. Please check your email or request a new code.'
			) {
				showMessage({
					message: 'Info',
					description: errorMessage,
					type: 'info',
				});
				setEmail(data.email);
				setView('otp');
			} else {
				showMessage({
					message: 'Error',
					description: errorMessage,
					type: 'danger',
				});
			}
		} finally {
			setIsLoading(false);
		}
	}, []);

	const onVerifyOTP = useCallback(
		async (data: OTPFormData) => {
			setIsLoading(true);
			try {
				const response = await verifyEmail({ email, otp: data.otp });
				if (response.data.success) {
					showMessage({
						message: 'Verification Successful',
						description: response.data.message,
						type: 'success',
					});
					setLoginData(response.data.data);
				} else {
					showMessage({
						message: 'Verification Failed',
						description: response.data.message || 'Verification failed',
						type: 'danger',
					});
				}
			} catch (error: any) {
				const errorMessage = error?.response?.data?.message || 'Invalid OTP';
				showMessage({
					message: 'Error',
					description: errorMessage,
					type: 'danger',
				});
			} finally {
				setIsLoading(false);
			}
		},
		[email, setLoginData],
	);

	const handleResendCode = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await resendVerificationCode(email);
			if (response.data.success) {
				showMessage({
					message: 'Code Sent',
					description: response.data.message,
					type: 'success',
				});
				setCanResend(false);
			} else {
				showMessage({
					message: 'Failed',
					description: response.data.message || 'Failed to resend code',
					type: 'danger',
				});
			}
		} catch (error: any) {
			showMessage({
				message: 'Error',
				description: error?.response?.data?.message || 'Failed to resend code',
				type: 'danger',
			});
		} finally {
			setIsLoading(false);
		}
	}, [email]);

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
				<MainContainer
					scrollable={false}
					className="flex-1 px-6 pt-20 pb-8">
					{/* Hero Section with Enhanced Spacing */}
					<View className="mb-10">
						<View className="mb-8">
							<CustomImage
								source={require('../../assets/app-images/icon.png')}
								className="w-20 h-20 rounded-3xl shadow-lg"
								contentFit="cover"
							/>
						</View>
						<Text className="text-[40px] font-bold text-foreground mb-2 leading-tight">
							{view === 'register' ? 'Create Account' : 'Verify Email'}
						</Text>
						<Text className="text-base text-muted-foreground leading-relaxed">
							{view === 'register'
								? 'Start your journey with UploadDoc'
								: `Enter the code sent to ${email}`}
						</Text>
					</View>

					{/* Form Container */}
					<View className="flex-1">
						{view === 'register' ? (
							<RegistrationForm
								onSubmit={onRegister}
								isLoading={isLoading}
							/>
						) : (
							<OtpVerificationForm
								onSubmit={onVerifyOTP}
								onResend={handleResendCode}
								onHelp={() => setIsHelpModalOpen(true)}
								onBack={() => setView('register')}
								isLoading={isLoading}
								canResend={canResend}
							/>
						)}
					</View>
				</MainContainer>

				<CustomModal
					isVisible={isHelpModalOpen}
					onClose={() => setIsHelpModalOpen(false)}>
					<View className="py-4">
						<Text className="text-xl font-bold text-foreground mb-4">
							Help & Support
						</Text>
						<Text className="text-foreground text-base mb-4 leading-6">
							A verification code (OTP) has been sent to your email address (
							{email}). You must enter this code to log in.
						</Text>
						<Text className="text-foreground text-base mb-6 leading-6">
							For assistance, contact{' '}
							<Text className="text-primary text-base font-semibold">
								danielagbeni12@gmail.com
							</Text>
						</Text>
						<AuthButton
							title="Close"
							onPress={() => setIsHelpModalOpen(false)}
						/>
					</View>
				</CustomModal>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
