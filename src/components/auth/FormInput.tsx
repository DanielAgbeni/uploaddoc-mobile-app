import React, { useState } from 'react';
import {
	View,
	Text,
	TextInput,
	TextInputProps,
	Pressable,
	StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

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

export default function FormInput<T extends FieldValues>({
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

	return (
		<View className={`mb-5 ${containerClassName}`}>
			{/* Label */}
			<Text className="text-foreground font-semibold mb-2 text-base">
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
							className={`flex-row items-center bg-card border pl-4 pr-2 rounded-xl overflow-hidden ${
								error
									? 'border-destructive'
									: isFocused
										? 'border-primary'
										: 'border-border'
							}`}
							style={styles.inputContainer}>
							{/* Text Input */}
							<TextInput
								className={`flex-1 py-4 text-foreground text-base ${
									!icon ? 'pl-4' : ''
								} ${!showPasswordToggle ? 'pr-4' : ''} ${className}`}
								placeholder={placeholder}
								placeholderTextColor="#888"
								value={value}
								onChangeText={onChange}
								onBlur={() => {
									onBlur();
									setIsFocused(false);
								}}
								onFocus={() => setIsFocused(true)}
								secureTextEntry={isPassword && !isPasswordVisible}
								{...textInputProps}
							/>

							{/* Password Visibility Toggle */}
							{showPasswordToggle && (
								<Pressable
									onPress={() => setIsPasswordVisible(!isPasswordVisible)}
									className="px-4 active:opacity-70"
									hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
									<Text className="text-primary font-semibold text-base">
										{isPasswordVisible ? 'Hide' : 'Show'}
									</Text>
								</Pressable>
							)}
						</View>

						{/* Error Message */}
						{error && (
							<View className="flex-row items-center mt-2">
								<Icon
									name="alert-circle"
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

const styles = StyleSheet.create({
	inputContainer: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
});
