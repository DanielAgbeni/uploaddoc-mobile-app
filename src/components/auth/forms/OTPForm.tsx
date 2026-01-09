import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import FormInput from '../FormInput';
import AuthButton from '../AuthButton';
import TextComponent from '../../ui/TextComponent';

interface OTPFormProps {
	onSubmit: (data: any) => void;
	isLoading: boolean;
	onResend: () => void;
	canResend: boolean;
	timer: number;
	email: string;
	onBackToSignUp: () => void;
}

const OTPForm = memo(
	({
		onSubmit,
		isLoading,
		onResend,
		canResend,
		timer,
		email,
		onBackToSignUp,
	}: OTPFormProps) => {
		const {
			control,
			handleSubmit,
			formState: { errors },
		} = useForm({
			defaultValues: { otp: '' },
		});

		return (
			<>
				<TextComponent className="text-base text-muted-foreground mb-6 text-center">
					Enter the code sent to {email}
				</TextComponent>
				<FormInput
					name="otp"
					control={control}
					label="Verification Code"
					placeholder="Enter OTP"
					icon="key-outline"
					keyboardType="number-pad"
					autoCapitalize="none"
					error={errors.otp?.message as string}
					rules={{
						required: 'OTP is required',
						minLength: { value: 4, message: 'Min 4 chars' },
					}}
				/>
				<AuthButton
					title="Verify Email"
					onPress={handleSubmit(onSubmit)}
					loading={isLoading}
					className="mb-4"
				/>
				<Pressable
					disabled={!canResend || isLoading}
					onPress={onResend}
					className="self-center p-2 mb-4">
					<TextComponent
						className={`font-semibold ${
							canResend ? 'text-primary' : 'text-muted-foreground'
						}`}>
						{canResend ? 'Resend Code' : `Resend Code (${timer}s)`}
					</TextComponent>
				</Pressable>
				<Pressable
					onPress={onBackToSignUp}
					className="self-center">
					<TextComponent className="text-muted-foreground">
						Back to Sign Up
					</TextComponent>
				</Pressable>
			</>
		);
	},
);

export default OTPForm;
