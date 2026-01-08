import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm } from 'react-hook-form';
import FormInput from '../FormInput';
import AuthButton from '../AuthButton';
import PasswordStrengthIndicator from '../PasswordStrengthIndicator';
import GoogleIcon from 'src/assets/icons/google.icon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from 'src/types/navigation.types';
import TextComponent from 'src/components/ui/TextComponent';

type SignUpFormData = {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
};

interface RegistrationFormProps {
	onSubmit: (data: SignUpFormData) => void;
	isLoading: boolean;
}

const RegistrationForm = ({ onSubmit, isLoading }: RegistrationFormProps) => {
	const navigation =
		useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<SignUpFormData>({
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const password = watch('password');

	return (
		<View>
			{/* Social Sign Up Section */}
			<View className="flex-row gap-3 mb-8">
				<Pressable
					className="flex-1 flex-row items-center justify-center border-2 border-border rounded-2xl py-4 bg-card active:bg-muted"
					style={({ pressed }) => ({
						transform: [{ scale: pressed ? 0.98 : 1 }],
					})}>
					<GoogleIcon />
					<TextComponent className="text-foreground font-semibold ml-2 text-sm">
						Google
					</TextComponent>
				</Pressable>
			</View>

			{/* Divider */}
			<View className="flex-row items-center mb-8">
				<View className="flex-1 h-px bg-border" />
				<TextComponent className="px-4 text-muted-foreground text-sm font-medium">
					Or sign up with email
				</TextComponent>
				<View className="flex-1 h-px bg-border" />
			</View>

			<FormInput
				name="name"
				control={control}
				label="Full Name"
				placeholder="John Doe"
				icon="person-outline"
				autoCapitalize="words"
				autoComplete="name"
				error={errors.name?.message}
				rules={{
					required: 'Full name is required',
					minLength: {
						value: 2,
						message: 'Name must be at least 2 characters',
					},
				}}
			/>

			<FormInput
				name="email"
				control={control}
				label="Email Address"
				placeholder="you@example.com"
				icon="mail-outline"
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

			<View className="mb-5">
				<FormInput
					name="password"
					control={control}
					label="Password"
					placeholder="Create a strong password"
					icon="lock-closed-outline"
					secureTextEntry
					autoComplete="password-new"
					error={errors.password?.message}
					rules={{
						required: 'Password is required',
						minLength: {
							value: 8,
							message: 'Password must be at least 8 characters',
						},
					}}
					containerClassName="mb-0"
				/>
				<PasswordStrengthIndicator password={password || ''} />
			</View>

			<FormInput
				name="confirmPassword"
				control={control}
				label="Confirm Password"
				placeholder="Re-enter your password"
				icon="lock-closed-outline"
				secureTextEntry
				autoComplete="password-new"
				error={errors.confirmPassword?.message}
				rules={{
					required: 'Please confirm your password',
					validate: (value: string) =>
						value === password || 'Passwords do not match',
				}}
			/>

			<View className="mb-6">
				<TextComponent className="text-muted-foreground text-sm text-center leading-5">
					By signing up, you agree to our{' '}
					<TextComponent className="text-primary font-semibold">
						Terms of Service
					</TextComponent>{' '}
					and{' '}
					<TextComponent className="text-primary font-semibold">
						Privacy Policy
					</TextComponent>
				</TextComponent>
			</View>

			<AuthButton
				title="Create Account"
				onPress={handleSubmit(onSubmit)}
				loading={isLoading}
				className="mb-8"
			/>

			<View className="items-center pt-4 pb-4">
				<View className="flex-row items-center">
					<TextComponent className="text-muted-foreground text-base mr-2">
						Already have an account?
					</TextComponent>
					<Pressable
						onPress={() => navigation.navigate('SignIn')}
						className="active:opacity-70 py-1">
						<TextComponent className="text-primary font-bold text-base">
							Sign In
						</TextComponent>
					</Pressable>
				</View>
			</View>
		</View>
	);
};

export default memo(RegistrationForm);
