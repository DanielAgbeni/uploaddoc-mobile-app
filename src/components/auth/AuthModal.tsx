import React, { memo, useState } from 'react';
import {
	View,
	Pressable,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import {
	GoogleSignin,
	statusCodes,
	isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import { CloseIcon } from 'src/assets/icons';
import { useLoginMutation } from '../../hooks/useLoginMutation';
import {
	registerUser,
	verifyEmail,
	resendVerificationCode,
	forgetpassword,
	resetPassword,
	googleLogin,
} from '../../api/auth';
import { showMessage } from 'react-native-flash-message';
import { useUserStore } from '../../shared/user-store/useUserStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import TextComponent from '../ui/TextComponent';
import { getErrorMessage } from '../../utils/error-handling';

import AuthErrorBanner from './AuthErrorBanner';

// Forms
import LoginForm from './forms/LoginForm';
import SignUpForm from './forms/SignUpForm';
import OTPForm from './forms/OTPForm';
import ForgotPasswordForm from './forms/ForgotPasswordForm';
import ResetPasswordForm from './forms/ResetPasswordForm';

interface AuthModalProps {
	isVisible: boolean;
	onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'otp' | 'forgotPassword' | 'resetPassword';

const AuthModal = ({ isVisible, onClose }: AuthModalProps) => {
	const navigation =
		useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
	const [mode, setMode] = useState<AuthMode>('login');
	const loginMutation = useLoginMutation();
	const setLoginData = useUserStore((state) => state.setLoginData);
	const [isLoading, setIsLoading] = useState(false);
	const [authError, setAuthError] = useState<string | null>(null);

	// Combined loading state for better UI feedback
	const isAnyLoading = isLoading || loginMutation.isPending;

	// State to hold temp data for flows
	const [tempEmail, setTempEmail] = useState('');
	const [canResend, setCanResend] = useState(true);
	const [timer, setTimer] = useState(0);

	// Timer effect
	React.useEffect(() => {
		setAuthError(null);
	}, [mode]);

	React.useEffect(() => {
		let interval: NodeJS.Timeout;
		if (!canResend && timer > 0) {
			interval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
		} else if (timer === 0 && !canResend) {
			setCanResend(true);
		}
		return () => clearInterval(interval);
	}, [canResend, timer]);

	// Google Signin Configure
	React.useEffect(() => {
		GoogleSignin.configure({
			webClientId:
				'711385990812-5r58ssnajdajr8ot33ncpnn131kqj5q4.apps.googleusercontent.com',
		});
	}, []);

	const onLogin = (data: any) => {
		setAuthError(null);
		loginMutation.mutate(
			{ email: data.email.trim(), password: data.password.trim() },
			{
				onSuccess: (response) => {
					showMessage({
						message: 'Login Successful',
						description: `Welcome back!`,
						type: 'success',
					});
					handleClose();
				},
				onError: (error: any) => {
					const errorMessage = getErrorMessage(error);
					setAuthError(errorMessage);
					showMessage({
						message: 'Login Failed',
						description: errorMessage,
						type: 'danger',
					});
				},
			},
		);
	};

	const onSignup = async (data: any) => {
		setAuthError(null);
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
				setTempEmail(data.email);
				setMode('otp');
				setCanResend(false);
				setTimer(60);
			} else {
				setAuthError(response.data.message);
				showMessage({
					message: 'Registration Failed',
					description: response.data.message,
					type: 'danger',
				});
			}
		} catch (error: any) {
			const errorMessage = getErrorMessage(error);
			setAuthError(errorMessage);
			if (
				errorMessage ===
				'Email verification already pending. Please check your email or request a new code.'
			) {
				showMessage({
					message: 'Info',
					description: errorMessage,
					type: 'info',
				});
				setTempEmail(data.email);
				setMode('otp');
				setCanResend(false);
				setTimer(60);
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
	};

	const onVerifyOtp = async (data: any) => {
		setAuthError(null);
		setIsLoading(true);
		try {
			const response = await verifyEmail({ email: tempEmail, otp: data.otp });
			if (response.data.success) {
				showMessage({
					message: 'Verification Successful',
					description: response.data.message,
					type: 'success',
				});
				setLoginData(response.data.data);
				handleClose();
			} else {
				setAuthError(response.data.message);
				showMessage({
					message: 'Verification Failed',
					description: response.data.message,
					type: 'danger',
				});
			}
		} catch (error: any) {
			const errorMessage = getErrorMessage(error);
			setAuthError(errorMessage);
			showMessage({
				message: 'Error',
				description: errorMessage,
				type: 'danger',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const onResendCode = async () => {
		setAuthError(null);
		setIsLoading(true);
		try {
			const response = await resendVerificationCode(tempEmail);
			if (response.data.success) {
				showMessage({
					message: 'Code Sent',
					description: response.data.message,
					type: 'success',
				});
				setCanResend(false);
				setTimer(60);
			} else {
				setAuthError(response.data.message);
				showMessage({
					message: 'Failed',
					description: response.data.message,
					type: 'danger',
				});
			}
		} catch (error: any) {
			const errorMessage = getErrorMessage(error);
			setAuthError(errorMessage);
			showMessage({
				message: 'Error',
				description: errorMessage,
				type: 'danger',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const onForgotPassword = async (data: any) => {
		setIsLoading(true);
		try {
			const response = await forgetpassword(data.email);
			if (response.data.success) {
				setTempEmail(data.email);
				setMode('resetPassword');
				showMessage({
					message: 'OTP Sent',
					description: 'Check your email for the OTP.',
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
			showMessage({
				message: 'Error',
				description: getErrorMessage(error),
				type: 'danger',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const onResetPassword = async (data: any) => {
		setIsLoading(true);
		try {
			const response = await resetPassword({
				email: tempEmail,
				otp: data.otp,
				newPassword: data.newPassword,
			});
			if (response.data.success) {
				showMessage({
					message: 'Password Reset Successful',
					description: 'Log in with your new password.',
					type: 'success',
				});
				setMode('login');
			} else {
				showMessage({
					message: 'Reset Failed',
					description: response.data.message,
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
	};

	const onGoogleButtonPress = async () => {
		setAuthError(null);
		setIsLoading(true);
		try {
			await GoogleSignin.hasPlayServices();
			const result = await GoogleSignin.signIn();

			// Handle both old and new API response structures
			const userInfo = (result as any).data ? (result as any).data : result;
			const isCancelled = (result as any).type === 'cancelled';

			if (isCancelled) {
				setIsLoading(false);
				return;
			}

			const idToken = userInfo?.idToken;

			if (idToken) {
				const response = await googleLogin(idToken);
				if (response.data.success) {
					showMessage({
						message: 'Login Successful',
						description: `Welcome back!`,
						type: 'success',
					});
					setLoginData(response.data.data);
					handleClose();
				} else {
					throw new Error(response.data.message || 'Google Login Failed');
				}
			} else {
				throw new Error('No ID Token obtained from Google');
			}
		} catch (error: any) {
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
				setAuthError(errorMessage);
				showMessage({
					message: 'Login Failed',
					description: errorMessage,
					type: 'danger',
				});
				console.log('Google login error:', error);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setMode('login');
		setAuthError(null);
		onClose();
	};

	return (
		<Modal
			isVisible={isVisible}
			onBackdropPress={handleClose}
			onSwipeComplete={handleClose}
			swipeDirection="down"
			animationIn="slideInUp"
			animationOut="slideOutDown"
			style={{ margin: 0, justifyContent: 'flex-end' }}
			propagateSwipe>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				className="bg-background rounded-t-[32px] h-[85%] shadow-xl overflow-hidden">
				{/* Drag Handle */}
				<View className="items-center pt-4 pb-2 w-full bg-background z-10">
					<View className="w-12 h-1.5 bg-muted rounded-full" />
				</View>

				{/* Header */}
				<View className="flex-row items-center justify-between px-6 pb-4 border-b border-border bg-background z-10">
					<View style={{ width: 24 }} />
					<TextComponent className="text-xl font-bold text-foreground">
						{mode === 'login' && 'Log in or sign up'}
						{mode === 'signup' && 'Create an account'}
						{mode === 'otp' && 'Verification'}
						{mode === 'forgotPassword' && 'Forgot Password'}
						{mode === 'resetPassword' && 'Reset Password'}
					</TextComponent>
					<Pressable
						onPress={handleClose}
						hitSlop={10}>
						<CloseIcon
							size={24}
							color="#666"
						/>
					</Pressable>
				</View>

				<AuthErrorBanner
					message={authError}
					className="mt-4"
				/>

				<ScrollView
					className="flex-1 px-6 pt-6"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 40 }}>
					{mode === 'login' && (
						<LoginForm
							onSubmit={onLogin}
							isLoading={isAnyLoading}
							onForgotPassword={() => setMode('forgotPassword')}
							onGoogleLogin={onGoogleButtonPress}
							onSignUpPress={() => setMode('signup')}
						/>
					)}

					{mode === 'signup' && (
						<SignUpForm
							onSubmit={onSignup}
							isLoading={isAnyLoading}
							onLoginPress={() => setMode('login')}
							onGoogleLogin={onGoogleButtonPress}
						/>
					)}

					{mode === 'otp' && (
						<OTPForm
							onSubmit={onVerifyOtp}
							isLoading={isAnyLoading}
							onResend={onResendCode}
							canResend={canResend}
							timer={timer}
							email={tempEmail}
							onBackToSignUp={() => setMode('signup')}
						/>
					)}

					{mode === 'forgotPassword' && (
						<ForgotPasswordForm
							onSubmit={onForgotPassword}
							isLoading={isAnyLoading}
							onBackToLogin={() => setMode('login')}
						/>
					)}

					{mode === 'resetPassword' && (
						<ResetPasswordForm
							onSubmit={onResetPassword}
							isLoading={isAnyLoading}
							onBackToLogin={() => setMode('login')}
							email={tempEmail}
						/>
					)}
				</ScrollView>
			</KeyboardAvoidingView>
		</Modal>
	);
};

export default memo(AuthModal);
