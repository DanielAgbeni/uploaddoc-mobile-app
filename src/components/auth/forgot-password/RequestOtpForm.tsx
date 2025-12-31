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

type RequestOtpFormData = {
	email: string;
};

interface RequestOtpFormProps {
	onSubmit: (data: RequestOtpFormData) => void;
	isLoading: boolean;
}

const RequestOtpForm = ({ onSubmit, isLoading }: RequestOtpFormProps) => {
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<RequestOtpFormData>({
		defaultValues: {
			email: '',
		},
	});

	return (
		<View>
			<FormInput
				name="email"
				control={control}
				label="Email Address"
				placeholder="Enter your email"
				keyboardType="email-address"
				autoCapitalize="none"
				autoComplete="email"
				error={errors.email?.message}
				rules={{
					required: 'Email is required',
					pattern: {
						value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
						message: 'Please enter a valid email address',
					},
				}}
			/>

			<AuthButton
				title="Send OTP"
				onPress={handleSubmit(onSubmit)}
				loading={isLoading}
				className="mb-6"
			/>
		</View>
	);
};

export default memo(RequestOtpForm);
