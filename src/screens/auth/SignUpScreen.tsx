import React, { useState, useCallback, useEffect, memo } from 'react';
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
import CustomModal from '../../components/ui/CustomModal';

// Components
import RegistrationForm from '../../components/auth/sign-up/RegistrationForm';
import OtpVerificationForm from '../../components/auth/sign-up/OtpVerificationForm';
import { getErrorMessage } from '../../utils/error-handling';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

type SignUpFormData = {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
};

type OTPFormData = {
	otp: string;
};

function SignUpScreen({ navigation }: Props) {
	const { colorScheme } = useTheme();
	const setLoginData = useUserStore((state) => state.setLoginData);

	const [view, setView] = useState<'register' | 'otp'>('register');
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [canResend, setCanResend] = useState(true);
	const [timer, setTimer] = useState(0);
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

	useEffect(() => {
		let interval: NodeJS.Timeout | undefined;

		if (!canResend && timer > 0) {
			interval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
		} else if (timer === 0 && !canResend) {
			setCanResend(true);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [canResend, timer]);

	const onRegister = useCallback(async (data: SignUpFormData) => {
		setIsLoading(true);
		try {
			const { confirmPassword, ...registerData } = data;
			void confirmPassword;
			const response = await registerUser(registerData);

			if (response.data.success) {
				showMessage({
					message: 'Registration Successful',
					description: response.data.message,
					type: 'success',
				});
				setEmail(response.data.data.email);
				setCanResend(response.data.data.canResend);
				setTimer(60);
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
					setCanResend(false);
					setTimer(60);
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
			const errorMessage = getErrorMessage(error);

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
				setCanResend(false);
				setTimer(60);
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
				const errorMessage = getErrorMessage(error);
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
				setTimer(60);
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
				description: getErrorMessage(error),
				type: 'danger',
			});
		} finally {
			setIsLoading(false);
		}
	}, [email]);

	const handleOpenHelpModal = useCallback(() => {
		setIsHelpModalOpen(true);
	}, []);

	const handleCloseHelpModal = useCallback(() => {
		setIsHelpModalOpen(false);
	}, []);

	const handleGoBackToRegister = useCallback(() => {
		setView('register');
	}, []);

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
				<MainContainer
					scrollable={false}
					className="flex-1 px-6 pt-16 pb-8">
					
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
							{view === 'register' ? 'Create Account' : 'Verify Email'}
						</Text>
						<Text className="text-base text-muted-foreground leading-relaxed">
							{view === 'register'
								? 'Start your journey with UploadDoc.'
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
								onHelp={handleOpenHelpModal}
								onBack={handleGoBackToRegister}
								isLoading={isLoading}
								canResend={canResend}
								timer={timer}
							/>
						)}
					</View>
				</MainContainer>

				<CustomModal
					isVisible={isHelpModalOpen}
					onClose={handleCloseHelpModal}>
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
							onPress={handleCloseHelpModal}
						/>
					</View>
				</CustomModal>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

export default memo(SignUpScreen);
