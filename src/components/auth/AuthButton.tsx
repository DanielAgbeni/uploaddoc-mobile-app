import React from 'react';
import {
	Pressable,
	Text,
	ActivityIndicator,
	View,
	PressableProps,
	StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

interface AuthButtonProps extends PressableProps {
	title: string;
	onPress: () => void;
	loading?: boolean;
	variant?: 'primary' | 'secondary' | 'outline';
	icon?: string;
	iconPosition?: 'left' | 'right';
	className?: string;
	fullWidth?: boolean;
}

export default function AuthButton({
	title,
	onPress,
	loading = false,
	variant = 'primary',
	icon,
	iconPosition = 'left',
	className = '',
	fullWidth = true,
	disabled,
	...pressableProps
}: AuthButtonProps) {
	const isDisabled = disabled || loading;

	const renderContent = () => (
		<View className="flex-row items-center justify-center gap-2">
			{loading ? (
				<>
					<ActivityIndicator
						color="#fff"
						size="small"
					/>
					<Text
						className={`font-bold text-lg ${
							variant === 'outline' ? 'text-primary' : 'text-primary-foreground'
						}`}>
						Please wait...
					</Text>
				</>
			) : (
				<>
					{icon && iconPosition === 'left' && (
						<Icon
							name={icon}
							size={20}
							color={variant === 'outline' ? '#444ebb' : '#fff'}
						/>
					)}
					<Text
						className={`font-bold text-lg ${
							variant === 'outline' ? 'text-primary' : 'text-primary-foreground'
						}`}>
						{title}
					</Text>
					{icon && iconPosition === 'right' && (
						<Icon
							name={icon}
							size={20}
							color={variant === 'outline' ? '#444ebb' : '#fff'}
						/>
					)}
				</>
			)}
		</View>
	);

	if (variant === 'primary') {
		return (
			<Pressable
				onPress={onPress}
				disabled={isDisabled}
				className={`overflow-hidden rounded-xl ${
					fullWidth ? 'w-full' : ''
				} ${className}`}
				style={({ pressed }) => [
					styles.button,
					{
						opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1,
						transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
					},
				]}
				{...pressableProps}>
				<LinearGradient
					colors={['#5461e8', '#444ebb']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.gradient}>
					{renderContent()}
				</LinearGradient>
			</Pressable>
		);
	}

	if (variant === 'secondary') {
		return (
			<Pressable
				onPress={onPress}
				disabled={isDisabled}
				className={`bg-secondary rounded-xl py-5 px-6 ${
					fullWidth ? 'w-full' : ''
				} ${isDisabled ? 'opacity-50' : 'active:opacity-90'} ${className}`}
				style={({ pressed }) => [
					styles.button,
					{
						transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
					},
				]}
				{...pressableProps}>
				{renderContent()}
			</Pressable>
		);
	}

	// Outline variant
	return (
		<Pressable
			onPress={onPress}
			disabled={isDisabled}
			className={`border-2 border-primary rounded-xl py-5 px-6 bg-transparent ${
				fullWidth ? 'w-full' : ''
			} ${isDisabled ? 'opacity-50' : 'active:opacity-70'} ${className}`}
			style={({ pressed }) => [
				styles.button,
				{
					transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
				},
			]}
			{...pressableProps}>
			{renderContent()}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		shadowColor: '#444ebb',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	gradient: {
		paddingVertical: 20,
		paddingHorizontal: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
