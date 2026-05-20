import React, { memo, useCallback, useState } from 'react';
import {
	View,
	Text,
	TextInput,
	TextInputProps,
	Pressable,
	StyleSheet,
} from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { EyeIcon, EyeOffIcon, AlertCircleIcon } from '../../assets/icons';

interface FormInputProps<T extends FieldValues> extends Omit<
	TextInputProps,
	'onChange' | 'onChangeText' | 'value'
> {
	name: Path<T>;
	control: Control<T>;
	label: string;
	placeholder: string;
	error?: string;
	icon?: string;
	secureTextEntry?: boolean;
	rules?: any;
	className?: string;
	containerClassName?: string;
}

function FormInput<T extends FieldValues>({
	name,
	control,
	label,
	placeholder,
	error,
	icon,
	secureTextEntry = false,
	rules,
	className = '',
	containerClassName = '',
	...textInputProps
}: FormInputProps<T>) {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const isPassword = secureTextEntry;
	const showPasswordToggle = isPassword;

	const handleTogglePasswordVisibility = useCallback(() => {
		setIsPasswordVisible((prev) => !prev);
	}, []);

	const handleFocus = useCallback(() => {
		setIsFocused(true);
	}, []);

	const handleBlurState = useCallback(() => {
		setIsFocused(false);
	}, []);

	return (
		<View className={`mb-5 ${containerClassName}`}>
			{/* Label */}
			<Text className="mb-2 text-base font-semibold text-foreground">
				{label}
			</Text>

			<Controller
				control={control}
				name={name}
				rules={rules}
				render={({ field: { onChange, onBlur, value } }) => (
					<View>
						{/* Input Container */}
						<View
							className={`min-h-[58px] flex-row items-center overflow-hidden rounded-2xl border bg-card pl-4 pr-2 ${
								error
									? 'border-destructive'
									: isFocused
										? 'border-primary'
										: 'border-border'
							}`}
							style={styles.inputContainer}>
							{/* Text Input */}
							<TextInput
								className={`flex-1 py-4 text-base text-foreground ${
									!icon ? 'pl-4' : ''
								} ${!showPasswordToggle ? 'pr-4' : ''} ${className}`}
								placeholder={placeholder}
								placeholderTextColor="#888"
								value={value}
								onChangeText={onChange}
								onBlur={() => {
									onBlur();
									handleBlurState();
								}}
								onFocus={handleFocus}
								secureTextEntry={isPassword && !isPasswordVisible}
								{...textInputProps}
							/>

							{/* Password Visibility Toggle */}
							{showPasswordToggle && (
								<Pressable
									onPress={handleTogglePasswordVisibility}
									className="min-h-[48px] min-w-[48px] items-center justify-center px-3 active:opacity-70"
									hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
									{isPasswordVisible ? (
										<EyeOffIcon
											size={24}
											color="#888"
										/>
									) : (
										<EyeIcon
											size={24}
											color="#888"
										/>
									)}
								</Pressable>
							)}
						</View>

						{/* Error Message */}
						{error && (
							<View className="flex-row items-center mt-2">
								<AlertCircleIcon
									size={14}
									color="#ef4444"
								/>
								<Text className="text-destructive text-sm ml-1">{error}</Text>
							</View>
						)}
					</View>
				)}
			/>
		</View>
	);
}

export default memo(FormInput) as typeof FormInput;

const styles = StyleSheet.create({
	inputContainer: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
});
