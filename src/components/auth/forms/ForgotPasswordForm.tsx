import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import FormInput from '../FormInput';
import AuthButton from '../AuthButton';
import TextComponent from '../../ui/TextComponent';

interface ForgotPasswordFormProps {
	onSubmit: (data: any) => void;
	isLoading: boolean;
	onBackToLogin: () => void;
}

const ForgotPasswordForm = memo(
	({ onSubmit, isLoading, onBackToLogin }: ForgotPasswordFormProps) => {
		const {
			control,
			handleSubmit,
			formState: { errors },
		} = useForm({
			defaultValues: { email: '' },
		});

		return (
			<>
				<TextComponent className="text-base text-muted-foreground mb-6">
					Enter your email and we'll send you reset instructions.
				</TextComponent>
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
				<AuthButton
					title="Send OTP"
					onPress={handleSubmit(onSubmit)}
					loading={isLoading}
					className="mb-4"
				/>
				<Pressable
					onPress={onBackToLogin}
					className="self-center p-2">
					<TextComponent className="text-primary font-semibold">
						Back to Login
					</TextComponent>
				</Pressable>
			</>
		);
	},
);

export default ForgotPasswordForm;
