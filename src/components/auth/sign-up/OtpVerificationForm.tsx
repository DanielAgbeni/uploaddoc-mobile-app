import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import FormInput from '../FormInput';
import AuthButton from '../AuthButton';

type OTPFormData = {
	otp: string;
};

interface OtpVerificationFormProps {
	onSubmit: (data: OTPFormData) => void;
	onResend: () => void;
	onHelp: () => void;
	onBack: () => void;
	isLoading: boolean;
	canResend: boolean;
	timer?: number;
}

const OtpVerificationForm = ({
	onSubmit,
	onResend,
	onHelp,
	onBack,
	isLoading,
	canResend,
	timer = 0,
}: OtpVerificationFormProps) => {
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<OTPFormData>({
		defaultValues: {
			otp: '',
		},
	});

	return (
		<View>
			<FormInput
				name="otp"
				control={control}
				label="Verification Code"
				placeholder="Enter OTP"
				icon="key-outline"
				keyboardType="number-pad"
				autoCapitalize="none"
				error={errors.otp?.message}
				rules={{
					required: 'OTP is required',
					minLength: {
						value: 4,
						message: 'OTP must be at least 4 chars',
					},
				}}
			/>

			<AuthButton
				title="Verify Email"
				onPress={handleSubmit(onSubmit)}
				loading={isLoading}
				className="mb-4"
			/>

			<View className="flex-row justify-between items-center mt-4">
				<Pressable
					onPress={onResend}
					disabled={!canResend || isLoading}
					className={`py-2 px-4 rounded-lg ${!canResend ? 'opacity-50' : ''}`}>
					<Text className="text-primary font-semibold">
						{canResend ? 'Resend Code' : `Resend Code (${timer}s)`}
					</Text>
				</Pressable>

				<Pressable
					onPress={onHelp}
					className="py-2 px-4">
					<Text className="text-muted-foreground underline">Help?</Text>
				</Pressable>
			</View>

			<Pressable
				onPress={onBack}
				className="mt-8 items-center py-2 active:opacity-75">
				<Text className="text-muted-foreground font-medium">Back to Registration</Text>
			</Pressable>
		</View>
	);
};

export default memo(OtpVerificationForm);
