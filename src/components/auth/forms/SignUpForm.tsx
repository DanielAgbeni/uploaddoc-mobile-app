import React, { memo, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import FormInput from '../FormInput';
import AuthButton from '../AuthButton';
import TextComponent from '../../ui/TextComponent';
import SocialLoginSection from '../SocialLoginSection';

interface SignUpFormProps {
	onSubmit: (data: any) => void;
	isLoading: boolean;
	onLoginPress: () => void;
	onGoogleLogin: () => void;
}

const SignUpForm = memo(
	({ onSubmit, isLoading, onLoginPress, onGoogleLogin }: SignUpFormProps) => {
		const {
			control,
			handleSubmit,
			watch,
			formState: { errors },
		} = useForm({
			defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
		});
		const signupPassword = watch('password');

		const handleContinuePress = useCallback(handleSubmit(onSubmit), [
			handleSubmit,
			onSubmit,
		]);

		const handleLoginPress = useCallback(() => {
			onLoginPress();
		}, [onLoginPress]);

		return (
			<>
				<FormInput
					name="name"
					control={control}
					label="Full Name"
					placeholder="John Doe"
					icon="person-outline"
					error={errors.name?.message as string}
					rules={{ required: 'Name is required' }}
				/>
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
				<FormInput
					name="password"
					control={control}
					label="Password"
					placeholder="Create password"
					secureTextEntry
					icon="lock-closed-outline"
					error={errors.password?.message as string}
					rules={{
						required: 'Password is required',
						minLength: { value: 8, message: 'Min 8 chars' },
					}}
				/>
				<FormInput
					name="confirmPassword"
					control={control}
					label="Confirm Password"
					placeholder="Confirm password"
					secureTextEntry
					icon="lock-closed-outline"
					error={errors.confirmPassword?.message as string}
					rules={{
						required: 'Confirm password',
						validate: (val: string) =>
							val === signupPassword || 'Passwords do not match',
					}}
				/>
				<AuthButton
					title="Continue"
					onPress={handleContinuePress}
					loading={isLoading}
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

				<SocialLoginSection
					onGoogleLogin={onGoogleLogin}
					isLoading={isLoading}
				/>
			</>
		);
	},
);

export default SignUpForm;
