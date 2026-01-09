import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import FormInput from '../FormInput';
import AuthButton from '../AuthButton';
import TextComponent from '../../ui/TextComponent';

interface ResetPasswordFormProps {
	onSubmit: (data: any) => void;
	isLoading: boolean;
	onBackToLogin: () => void;
	email: string;
}

const ResetPasswordForm = memo(
	({ onSubmit, isLoading, onBackToLogin, email }: ResetPasswordFormProps) => {
		const {
			control,
			handleSubmit,
			watch,
			formState: { errors },
		} = useForm({
			defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
		});
		const resetNewPassword = watch('newPassword');

		return (
			<>
				<TextComponent className="text-base text-muted-foreground mb-6">
					Enter the OTP sent to {email} and your new password.
				</TextComponent>
				<FormInput
					name="otp"
					control={control}
					label="OTP Code"
					placeholder="Enter OTP"
					keyboardType="number-pad"
					error={errors.otp?.message as string}
					rules={{ required: 'OTP is required' }}
				/>
				<FormInput
					name="newPassword"
					control={control}
					label="New Password"
					placeholder="New password"
					secureTextEntry
					icon="lock-closed-outline"
					error={errors.newPassword?.message as string}
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
							val === resetNewPassword || 'Passwords do not match',
					}}
				/>
				<AuthButton
					title="Reset Password"
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

export default ResetPasswordForm;
