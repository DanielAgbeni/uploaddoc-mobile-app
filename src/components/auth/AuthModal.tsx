import React, {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	useWindowDimensions,
	View,
} from 'react-native';
import Modal from 'react-native-modal';
import {
	GoogleSignin,
	isErrorWithCode,
	statusCodes,
} from '@react-native-google-signin/google-signin';
import { CloseIcon } from '../../assets/icons';
import { showMessage } from 'react-native-flash-message';
import { useLoginMutation } from '../../hooks/useLoginMutation';
import {
	forgetpassword,
	googleLogin,
	registerUser,
	resendVerificationCode,
	resetPassword,
	verifyEmail,
} from '../../api/auth';
import { useUserStore } from '../../shared/user-store/useUserStore';
import { getErrorMessage } from '../../utils/error-handling';
import TextComponent from '../ui/TextComponent';
import AuthErrorBanner from './AuthErrorBanner';
import ForgotPasswordForm from './forms/ForgotPasswordForm';
import LoginForm from './forms/LoginForm';
import OTPForm from './forms/OTPForm';
import ResetPasswordForm from './forms/ResetPasswordForm';
import SignUpForm from './forms/SignUpForm';

interface AuthModalProps {
	isVisible: boolean;
	onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'otp' | 'forgotPassword' | 'resetPassword';
type PagerMode = Extract<AuthMode, 'login' | 'signup'>;

type AuthModeCopy = {
	description: string;
	title: string;
};

const authModeCopy: Record<AuthMode, AuthModeCopy> = {
	login: {
		title: 'Welcome back',
		description:
			'Sign in to manage your documents with a clearer, faster workflow.',
	},
	signup: {
		title: 'Create your account',
		description:
			'Start sending, receiving, and organizing documents in one place.',
	},
	otp: {
		title: 'Verify your email',
		description:
			'Enter the code we sent so we can finish securing your account.',
	},
	forgotPassword: {
		title: 'Reset access',
		description:
			'We will send a one-time code so you can choose a new password.',
	},
	resetPassword: {
		title: 'Choose a new password',
		description:
			'Create a strong password you can remember and use right away.',
	},
};

const AuthModeSwitch = memo(function AuthModeSwitch({
	activeMode,
	onSelect,
}: {
	activeMode: PagerMode;
	onSelect: (mode: PagerMode) => void;
}) {
	const handleSelectLogin = useCallback(() => {
		onSelect('login');
	}, [onSelect]);

	const handleSelectSignup = useCallback(() => {
		onSelect('signup');
	}, [onSelect]);

	return (
		<View className="mb-4 rounded-[22px] border border-border bg-card/70 p-1">
			<View className="flex-row">
				<Pressable
					onPress={handleSelectLogin}
					className={`min-h-[52px] flex-1 items-center justify-center rounded-[18px] px-4 ${
						activeMode === 'login' ? 'bg-primary' : 'bg-transparent'
					}`}>
					<TextComponent
						className={`text-base font-bold ${
							activeMode === 'login'
								? 'text-primary-foreground'
								: 'text-muted-foreground'
						}`}>
						Log in
					</TextComponent>
				</Pressable>

				<Pressable
					onPress={handleSelectSignup}
					className={`min-h-[52px] flex-1 items-center justify-center rounded-[18px] px-4 ${
						activeMode === 'signup' ? 'bg-primary' : 'bg-transparent'
					}`}>
					<TextComponent
						className={`text-base font-bold ${
							activeMode === 'signup'
								? 'text-primary-foreground'
								: 'text-muted-foreground'
						}`}>
						Sign up
					</TextComponent>
				</Pressable>
			</View>
		</View>
	);
});

const AuthModal = ({ isVisible, onClose }: AuthModalProps) => {
	const loginMutation = useLoginMutation();
	const setLoginData = useUserStore((state) => state.setLoginData);
	const pagerScrollRef = useRef<ScrollView>(null);
	const { width: windowWidth } = useWindowDimensions();
	const [mode, setMode] = useState<AuthMode>('login');
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [authError, setAuthError] = useState<string | null>(null);
	const [tempEmail, setTempEmail] = useState('');
	const [canResend, setCanResend] = useState(true);
	const [timer, setTimer] = useState(0);

	const horizontalPadding = 40;
	const pageWidth = Math.max(windowWidth - horizontalPadding, 280);
	const isAnyLoading = isLoading || loginMutation.isPending;
	const isPagerMode = mode === 'login' || mode === 'signup';
	const pagerMode = (mode === 'signup' ? 'signup' : 'login') as PagerMode;
	const currentCopy = authModeCopy[mode];

	useEffect(() => {
		setAuthError(null);
	}, [mode]);

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

	useEffect(() => {
		GoogleSignin.configure({
			webClientId:
				'711385990812-5r58ssnajdajr8ot33ncpnn131kqj5q4.apps.googleusercontent.com',
		});
	}, []);

	const scrollToPagerMode = useCallback(
		(nextMode: PagerMode, animated: boolean) => {
			const x = nextMode === 'signup' ? pageWidth : 0;
			pagerScrollRef.current?.scrollTo({ x, animated });
		},
		[pageWidth],
	);

	useEffect(() => {
		if (isVisible && isPagerMode) {
			scrollToPagerMode(pagerMode, false);
		}
	}, [isPagerMode, isVisible, pagerMode, scrollToPagerMode]);

	const handleSetPagerMode = useCallback(
		(nextMode: PagerMode) => {
			setMode(nextMode);
			scrollToPagerMode(nextMode, true);
		},
		[scrollToPagerMode],
	);

	const handlePagerMomentumEnd = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const offsetX = event.nativeEvent.contentOffset.x;
			const nextMode = offsetX >= pageWidth / 2 ? 'signup' : 'login';
			setMode(nextMode);
		},
		[pageWidth],
	);

	const handleClose = useCallback(() => {
		setMode('login');
		setAuthError(null);
		onClose();
	}, [onClose]);

	const handleShowForgotPassword = useCallback(() => {
		setMode('forgotPassword');
	}, []);

	const handleShowSignup = useCallback(() => {
		handleSetPagerMode('signup');
	}, [handleSetPagerMode]);

	const handleShowLogin = useCallback(() => {
		handleSetPagerMode('login');
	}, [handleSetPagerMode]);

	const handleLogin = useCallback(
		(data: { email: string; password: string }) => {
			setAuthError(null);
			loginMutation.mutate(
				{ email: data.email.trim(), password: data.password.trim() },
				{
					onSuccess: () => {
						showMessage({
							message: 'Login Successful',
							description: 'Welcome back!',
							type: 'success',
						});
						handleClose();
					},
					onError: (error: unknown) => {
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
		},
		[handleClose, loginMutation],
	);

	const handleSignup = useCallback(
		async (data: {
			confirmPassword: string;
			email: string;
			name: string;
			password: string;
		}) => {
			setAuthError(null);
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
					setTempEmail(data.email);
					setMode('otp');
					setCanResend(false);
					setTimer(60);
					return;
				}

				setAuthError(response.data.message);
				showMessage({
					message: 'Registration Failed',
					description: response.data.message,
					type: 'danger',
				});
			} catch (error: unknown) {
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
		},
		[],
	);

	const handleVerifyOtp = useCallback(
		async (data: { otp: string }) => {
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
					return;
				}

				setAuthError(response.data.message);
				showMessage({
					message: 'Verification Failed',
					description: response.data.message,
					type: 'danger',
				});
			} catch (error: unknown) {
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
		},
		[handleClose, setLoginData, tempEmail],
	);

	const handleResendCode = useCallback(async () => {
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
				return;
			}

			setAuthError(response.data.message);
			showMessage({
				message: 'Failed',
				description: response.data.message,
				type: 'danger',
			});
		} catch (error: unknown) {
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
	}, [tempEmail]);

	const handleForgotPassword = useCallback(async (data: { email: string }) => {
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
				return;
			}

			showMessage({
				message: 'Failed',
				description: response.data.message,
				type: 'danger',
			});
		} catch (error: unknown) {
			showMessage({
				message: 'Error',
				description: getErrorMessage(error),
				type: 'danger',
			});
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleResetPassword = useCallback(
		async (data: { newPassword: string; otp: string }) => {
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
					return;
				}

				showMessage({
					message: 'Reset Failed',
					description: response.data.message,
					type: 'danger',
				});
			} catch (error: unknown) {
				showMessage({
					message: 'Error',
					description: getErrorMessage(error),
					type: 'danger',
				});
			} finally {
				setIsLoading(false);
			}
		},
		[tempEmail],
	);

	const handleGoogleButtonPress = useCallback(async () => {
		setAuthError(null);
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
				setIsLoading(false);
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
			handleClose();
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
				setAuthError(errorMessage);
				showMessage({
					message: 'Login Failed',
					description: errorMessage,
					type: 'danger',
				});
			}
		} finally {
			setIsGoogleLoading(false);
		}
	}, [handleClose, setLoginData]);

	const pagerContent = useMemo(
		() => (
			<ScrollView
				ref={pagerScrollRef}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onMomentumScrollEnd={handlePagerMomentumEnd}
				scrollEventThrottle={16}
				keyboardShouldPersistTaps="handled"
				className="flex-1"
				contentContainerStyle={{ flexGrow: 1 }}>
				<View
					style={{ width: pageWidth }}
					className="flex-1 pr-4">
					<ScrollView
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
						contentContainerStyle={{ paddingBottom: 40 }}>
						<LoginForm
							onSubmit={handleLogin}
							isLoading={loginMutation.isPending}
							isGoogleLoading={isGoogleLoading}
							onForgotPassword={handleShowForgotPassword}
							onGoogleLogin={handleGoogleButtonPress}
							onSignUpPress={handleShowSignup}
						/>
					</ScrollView>
				</View>

				<View
					style={{ width: pageWidth }}
					className="flex-1">
					<ScrollView
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
						contentContainerStyle={{ paddingBottom: 40 }}>
						<SignUpForm
							onSubmit={handleSignup}
							isLoading={isLoading}
							isGoogleLoading={isGoogleLoading}
							onLoginPress={handleShowLogin}
							onGoogleLogin={handleGoogleButtonPress}
						/>
					</ScrollView>
				</View>
			</ScrollView>
		),
		[
			handleGoogleButtonPress,
			handleLogin,
			handlePagerMomentumEnd,
			handleShowForgotPassword,
			handleShowLogin,
			handleShowSignup,
			handleSignup,
			isGoogleLoading,
			isLoading,
			loginMutation.isPending,
			pageWidth,
		],
	);

	const singleModeContent = useMemo(() => {
		if (mode === 'otp') {
			return (
				<OTPForm
					onSubmit={handleVerifyOtp}
					isLoading={isAnyLoading}
					onResend={handleResendCode}
					canResend={canResend}
					timer={timer}
					email={tempEmail}
					onBackToSignUp={handleShowSignup}
				/>
			);
		}

		if (mode === 'forgotPassword') {
			return (
				<ForgotPasswordForm
					onSubmit={handleForgotPassword}
					isLoading={isAnyLoading}
					onBackToLogin={handleShowLogin}
				/>
			);
		}

		if (mode === 'resetPassword') {
			return (
				<ResetPasswordForm
					onSubmit={handleResetPassword}
					isLoading={isAnyLoading}
					onBackToLogin={handleShowLogin}
					email={tempEmail}
				/>
			);
		}

		return null;
	}, [
		canResend,
		handleForgotPassword,
		handleResendCode,
		handleResetPassword,
		handleShowLogin,
		handleShowSignup,
		handleVerifyOtp,
		isAnyLoading,
		mode,
		tempEmail,
		timer,
	]);

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
				className="h-[88%] overflow-hidden rounded-t-[36px] border border-border bg-background">
				<View className="items-center pb-2 pt-4">
					<View className="h-1.5 w-14 rounded-full bg-muted" />
				</View>

				<View className="px-5 pb-4 pt-2">
					<View className="flex-row items-start justify-between gap-4">
						<View className="flex-1">
							<TextComponent className="mb-2 text-[30px] font-extrabold leading-9 tracking-tight text-foreground">
								{currentCopy.title}
							</TextComponent>
							<TextComponent className="text-base leading-7 text-muted-foreground">
								{currentCopy.description}
							</TextComponent>
						</View>

						<Pressable
							onPress={handleClose}
							hitSlop={12}
							className="min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-border bg-card">
							<CloseIcon
								size={20}
								color="#666"
							/>
						</Pressable>
					</View>

					<AuthErrorBanner
						message={authError}
						className="mt-4"
					/>
				</View>

				<View className="flex-1 rounded-t-[30px] border-t border-border bg-card px-5 pt-5">
					{isPagerMode ? (
						<>
							<AuthModeSwitch
								activeMode={pagerMode}
								onSelect={handleSetPagerMode}
							/>
							{pagerContent}
						</>
					) : (
						<ScrollView
							className="flex-1"
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
							contentContainerStyle={{ paddingBottom: 40 }}>
							{singleModeContent}
						</ScrollView>
					)}
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
};

export default memo(AuthModal);
