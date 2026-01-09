import React, { memo, useState } from 'react';
import {
	View,
	Text,
	Pressable,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { useForm } from 'react-hook-form';
import {
	GoogleSignin,
	statusCodes,
	isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import FormInput from './FormInput';
import AuthButton from './AuthButton';
import {
	AppleIcon,
	FacebookIcon,
	GoogleIcon,
	CloseIcon,
} from 'src/assets/icons';
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

	// State to hold temp data for flows
	const [tempEmail, setTempEmail] = useState('');
	const [canResend, setCanResend] = useState(true);
	const [timer, setTimer] = useState(0);

	// Timer effect
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
				'32599014807-5903r9empqsb9gogojkqms9jkgh4rrnk.apps.googleusercontent.com',
		});
	}, []);

	// Login Form
	const {
		control: loginControl,
		handleSubmit: handleLoginSubmit,
		formState: { errors: loginErrors },
		reset: resetLoginForm,
	} = useForm({
		defaultValues: { email: '', password: '' },
	});

	// SignUp Form
	const {
		control: signupControl,
		handleSubmit: handleSignupSubmit,
		formState: { errors: signupErrors },
		watch: watchSignup,
		reset: resetSignupForm,
	} = useForm({
		defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
	});

	// OTP Form
	const {
		control: otpControl,
		handleSubmit: handleOtpSubmit,
		formState: { errors: otpErrors },
		reset: resetOtpForm,
	} = useForm({
		defaultValues: { otp: '' },
	});

	// Forgot/Reset Password Forms
	const {
		control: forgotPasswordControl,
		handleSubmit: handleForgotPasswordSubmit,
		formState: { errors: forgotPasswordErrors },
		reset: resetForgotPasswordForm,
	} = useForm({
		defaultValues: { email: '' },
	});

	const {
		control: resetPasswordControl,
		handleSubmit: handleResetPasswordSubmit,
		formState: { errors: resetPasswordErrors },
		watch: watchResetPassword,
		reset: resetResetPasswordForm,
	} = useForm({
		defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
	});

	const signupPassword = watchSignup('password');
	const resetNewPassword = watchResetPassword('newPassword');

	const onLogin = (data: any) => {
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
					const errorMessage = error.response?.data?.message || 'Login failed';
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
				showMessage({
					message: 'Registration Failed',
					description: response.data.message,
					type: 'danger',
				});
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
				showMessage({
					message: 'Verification Failed',
					description: response.data.message,
					type: 'danger',
				});
			}
		} catch (error: any) {
			showMessage({
				message: 'Error',
				description: error?.response?.data?.message || 'Invalid OTP',
				type: 'danger',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const onResendCode = async () => {
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
				showMessage({
					message: 'Failed',
					description: response.data.message,
					type: 'danger',
				});
			}
		} catch (error: any) {
			showMessage({
				message: 'Error',
				description: error?.response?.data?.message,
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
				description: error.response?.data?.message || 'Request failed',
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
				description: error.response?.data?.message || 'Reset failed',
				type: 'danger',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const onGoogleButtonPress = async () => {
		setIsLoading(true);
		try {
			await GoogleSignin.hasPlayServices();
			const userInfo = await GoogleSignin.signIn();
			const idToken = userInfo.data?.idToken;

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
			if (isErrorWithCode(error)) {
				switch (error.code) {
					case statusCodes.SIGN_IN_CANCELLED:
						errorMessage = 'Sign in cancelled';
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
				errorMessage =
					error?.response?.data?.message ||
					error.message ||
					'Google login failed';
			}

			if (errorMessage !== 'Sign in cancelled') {
				showMessage({
					message: 'Login Failed',
					description: errorMessage,
					type: 'danger',
				});
				console.log(error);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setMode('login');
		resetLoginForm();
		resetSignupForm();
		resetOtpForm();
		resetForgotPasswordForm();
		resetResetPasswordForm();
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
				<View className="flex-row items-center justify-between px-6 pb-4 border-b border-border/50 bg-background z-10">
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

				<ScrollView
					className="flex-1 px-6 pt-6"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 40 }}>
					{mode === 'login' && (
						<>
							<FormInput
								name="email"
								control={loginControl}
								label="Email Address"
								placeholder="you@example.com"
								icon="mail-outline"
								keyboardType="email-address"
								autoCapitalize="none"
								error={loginErrors.email?.message as string}
								rules={{ required: 'Email is required' }}
							/>
							<View className="mb-6">
								<FormInput
									name="password"
									control={loginControl}
									label="Password"
									placeholder="Enter your password"
									secureTextEntry
									icon="lock-closed-outline"
									error={loginErrors.password?.message as string}
									rules={{ required: 'Password is required' }}
									containerClassName="mb-1"
								/>
								<Pressable
									onPress={() => setMode('forgotPassword')}
									className="self-end p-1">
									<TextComponent className="text-primary font-semibold text-sm">
										Forgot Password?
									</TextComponent>
								</Pressable>
							</View>

							<AuthButton
								title="Continue"
								onPress={handleLoginSubmit(onLogin)}
								loading={loginMutation.isPending}
								className="mb-8"
							/>

							{/* Divider */}
							<View className="flex-row items-center mb-8">
								<View className="flex-1 h-px bg-border" />
								<TextComponent className="px-4 text-muted-foreground text-sm font-medium">
									or
								</TextComponent>
								<View className="flex-1 h-px bg-border" />
							</View>

							{/* Social Buttons */}
							<View className="gap-3 mb-8">
								<Pressable
									className="flex-row items-center border border-border rounded-xl p-4 bg-background active:bg-muted"
									disabled={loginMutation.isPending || isLoading}
									onPress={onGoogleButtonPress}>
									<GoogleIcon size={24} />
									<TextComponent className="flex-1 text-center font-semibold text-foreground">
										Continue with Google
									</TextComponent>
								</Pressable>
							</View>

							<View className="flex-row justify-center pb-8">
								<TextComponent className="text-muted-foreground text-base mr-1">
									Don't have an account?
								</TextComponent>
								<Pressable onPress={() => setMode('signup')}>
									<TextComponent className="text-primary font-bold text-base">
										Sign up
									</TextComponent>
								</Pressable>
							</View>
						</>
					)}

					{mode === 'signup' && (
						<>
							<FormInput
								name="name"
								control={signupControl}
								label="Full Name"
								placeholder="John Doe"
								icon="person-outline"
								error={signupErrors.name?.message as string}
								rules={{ required: 'Name is required' }}
							/>
							<FormInput
								name="email"
								control={signupControl}
								label="Email Address"
								placeholder="you@example.com"
								icon="mail-outline"
								keyboardType="email-address"
								autoCapitalize="none"
								error={signupErrors.email?.message as string}
								rules={{ required: 'Email is required' }}
							/>
							<FormInput
								name="password"
								control={signupControl}
								label="Password"
								placeholder="Create password"
								secureTextEntry
								icon="lock-closed-outline"
								error={signupErrors.password?.message as string}
								rules={{
									required: 'Password is required',
									minLength: { value: 8, message: 'Min 8 chars' },
								}}
							/>
							<FormInput
								name="confirmPassword"
								control={signupControl}
								label="Confirm Password"
								placeholder="Confirm password"
								secureTextEntry
								icon="lock-closed-outline"
								error={signupErrors.confirmPassword?.message as string}
								rules={{
									required: 'Confirm password',
									validate: (val: string) =>
										val === signupPassword || 'Passwords do not match',
								}}
							/>
							<AuthButton
								title="Continue"
								onPress={handleSignupSubmit(onSignup)}
								loading={isLoading}
								className="mb-8"
							/>

							<View className="flex-row justify-center pb-8">
								<TextComponent className="text-muted-foreground text-base mr-1">
									Already have an account?
								</TextComponent>
								<Pressable onPress={() => setMode('login')}>
									<TextComponent className="text-primary/50 font-bold text-base">
										Log in
									</TextComponent>
								</Pressable>
							</View>
						</>
					)}

					{mode === 'otp' && (
						<>
							<TextComponent className="text-base text-muted-foreground mb-6 text-center">
								Enter the code sent to {tempEmail}
							</TextComponent>
							<FormInput
								name="otp"
								control={otpControl}
								label="Verification Code"
								placeholder="Enter OTP"
								icon="key-outline"
								keyboardType="number-pad"
								autoCapitalize="none"
								error={otpErrors.otp?.message as string}
								rules={{
									required: 'OTP is required',
									minLength: { value: 4, message: 'Min 4 chars' },
								}}
							/>
							<AuthButton
								title="Verify Email"
								onPress={handleOtpSubmit(onVerifyOtp)}
								loading={isLoading}
								className="mb-4"
							/>
							<Pressable
								disabled={!canResend || isLoading}
								onPress={onResendCode}
								className="self-center p-2 mb-4">
								<TextComponent
									className={`font-semibold ${canResend ? 'text-primary' : 'text-muted-foreground'}`}>
									{canResend ? 'Resend Code' : `Resend Code (${timer}s)`}
								</TextComponent>
							</Pressable>
							<Pressable
								onPress={() => setMode('signup')}
								className="self-center">
								<TextComponent className="text-muted-foreground">
									Back to Sign Up
								</TextComponent>
							</Pressable>
						</>
					)}

					{mode === 'forgotPassword' && (
						<>
							<TextComponent className="text-base text-muted-foreground mb-6">
								Enter your email and we'll send you reset instructions.
							</TextComponent>
							<FormInput
								name="email"
								control={forgotPasswordControl}
								label="Email Address"
								placeholder="you@example.com"
								icon="mail-outline"
								keyboardType="email-address"
								autoCapitalize="none"
								error={forgotPasswordErrors.email?.message as string}
								rules={{ required: 'Email is required' }}
							/>
							<AuthButton
								title="Send OTP"
								onPress={handleForgotPasswordSubmit(onForgotPassword)}
								loading={isLoading}
								className="mb-4"
							/>
							<Pressable
								onPress={() => setMode('login')}
								className="self-center p-2">
								<TextComponent className="text-primary font-semibold">
									Back to Login
								</TextComponent>
							</Pressable>
						</>
					)}

					{mode === 'resetPassword' && (
						<>
							<TextComponent className="text-base text-muted-foreground mb-6">
								Enter the OTP sent to {tempEmail} and your new password.
							</TextComponent>
							<FormInput
								name="otp"
								control={resetPasswordControl}
								label="OTP Code"
								placeholder="Enter OTP"
								keyboardType="number-pad"
								error={resetPasswordErrors.otp?.message as string}
								rules={{ required: 'OTP is required' }}
							/>
							<FormInput
								name="newPassword"
								control={resetPasswordControl}
								label="New Password"
								placeholder="New password"
								secureTextEntry
								icon="lock-closed-outline"
								error={resetPasswordErrors.newPassword?.message as string}
								rules={{
									required: 'Password is required',
									minLength: { value: 8, message: 'Min 8 chars' },
								}}
							/>
							<FormInput
								name="confirmPassword"
								control={resetPasswordControl}
								label="Confirm Password"
								placeholder="Confirm password"
								secureTextEntry
								icon="lock-closed-outline"
								error={resetPasswordErrors.confirmPassword?.message as string}
								rules={{
									required: 'Confirm password',
									validate: (val: string) =>
										val === resetNewPassword || 'Passwords do not match',
								}}
							/>
							<AuthButton
								title="Reset Password"
								onPress={handleResetPasswordSubmit(onResetPassword)}
								loading={isLoading}
								className="mb-4"
							/>
							<Pressable
								onPress={() => setMode('login')}
								className="self-center p-2">
								<TextComponent className="text-primary font-semibold">
									Back to Login
								</TextComponent>
							</Pressable>
						</>
					)}
				</ScrollView>
			</KeyboardAvoidingView>
		</Modal>
	);
};

export default memo(AuthModal);
