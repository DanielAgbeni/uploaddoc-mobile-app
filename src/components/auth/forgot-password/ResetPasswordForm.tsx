import React, { memo } from 'react';
import { View } from 'react-native';
import {
	useForm,
	Control,
	FieldErrors,
	UseFormHandleSubmit,
} from 'react-hook-form';
import FormInput from '../FormInput';
import AuthButton from '../AuthButton';

type ResetPasswordFormData = {
	otp: string;
	newPassword: string;
	confirmPassword: string;
};

interface ResetPasswordFormProps {
	onSubmit: (data: ResetPasswordFormData) => void;
	isLoading: boolean;
}

const ResetPasswordForm = ({ onSubmit, isLoading }: ResetPasswordFormProps) => {
	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<ResetPasswordFormData>({
		defaultValues: {
			otp: '',
			newPassword: '',
			confirmPassword: '',
		},
	});

	const newPassword = watch('newPassword');

	return (
		<View>
			<FormInput
				name="otp"
				control={control}
				label="OTP Code"
				placeholder="Enter OTP"
				keyboardType="number-pad"
				autoCapitalize="none"
				error={errors.otp?.message}
				rules={{
					required: 'OTP is required',
					minLength: {
						value: 4,
						message: 'OTP must be at least 4 characters',
					},
				}}
			/>

			<FormInput
				name="newPassword"
				control={control}
				label="New Password"
				placeholder="New Password"
				secureTextEntry
				error={errors.newPassword?.message}
				rules={{
					required: 'New Password is required',
					minLength: {
						value: 8,
						message: 'Password must be at least 8 characters',
					},
				}}
			/>

			<FormInput
				name="confirmPassword"
				control={control}
				label="Confirm New Password"
				placeholder="Confirm New Password"
				secureTextEntry
				error={errors.confirmPassword?.message}
				rules={{
					required: 'Please confirm your password',
					validate: (value: string) =>
						value === newPassword || 'Passwords do not match',
				}}
			/>

			<AuthButton
				title="Reset Password"
				onPress={handleSubmit(onSubmit)}
				loading={isLoading}
				className="mb-6"
			/>
		</View>
	);
};

export default memo(ResetPasswordForm);
