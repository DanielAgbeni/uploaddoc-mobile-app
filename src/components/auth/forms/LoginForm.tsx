import React, { memo } from 'react';
import { View, Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import FormInput from '../FormInput';
import AuthButton from '../AuthButton';
import TextComponent from '../../ui/TextComponent';
import SocialLoginSection from '../SocialLoginSection';

interface LoginFormProps {
	onSubmit: (data: any) => void;
	isLoading: boolean;
	onForgotPassword: () => void;
	onGoogleLogin: () => void;
	onSignUpPress: () => void;
}

const LoginForm = memo(
	({
		onSubmit,
		isLoading,
		onForgotPassword,
		onGoogleLogin,
		onSignUpPress,
	}: LoginFormProps) => {
		const {
			control,
			handleSubmit,
			formState: { errors },
		} = useForm({
			defaultValues: { email: '', password: '' },
		});

		return (
			<>
				<FormInput
					name="email"
					control={control}
					label="Email Address"
					placeholder="you@example.com"
					icon="mail-outline"
					keyboardType="email-address"
					autoCapitalize="none"
					error={errors.email?.message as string}
					rules={{ required: 'Email is required' }}
				/>
				<View className="mb-6">
					<FormInput
						name="password"
						control={control}
						label="Password"
						placeholder="Enter your password"
						secureTextEntry
						icon="lock-closed-outline"
						error={errors.password?.message as string}
						rules={{ required: 'Password is required' }}
						containerClassName="mb-1"
					/>
					<Pressable
						onPress={onForgotPassword}
						className="self-end p-1">
						<TextComponent className="text-primary font-semibold text-sm">
							Forgot Password?
						</TextComponent>
					</Pressable>
				</View>

				<AuthButton
					title="Continue"
					onPress={handleSubmit(onSubmit)}
					loading={isLoading}
					className="mb-8"
				/>

				{/* Divider */}
				{/* <View className="flex-row items-center mb-8">
					<View className="flex-1 h-px bg-border" />
					<TextComponent className="px-4 text-muted-foreground text-sm font-medium">
						or
					</TextComponent>
					<View className="flex-1 h-px bg-border" />
				</View>

				<SocialLoginSection
					onGoogleLogin={onGoogleLogin}
					isLoading={isLoading}
				/> */}

				<View className="flex-row justify-center pb-8">
					<TextComponent className="text-muted-foreground text-base mr-1">
						Don't have an account?
					</TextComponent>
					<Pressable onPress={onSignUpPress}>
						<TextComponent className="text-primary font-bold text-base">
							Sign up
						</TextComponent>
					</Pressable>
				</View>
			</>
		);
	},
);

export default LoginForm;
