import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
	calculatePasswordStrength,
	PasswordStrengthResult,
} from '../../utils/passwordStrength';

interface PasswordStrengthIndicatorProps {
	password: string;
	showFeedback?: boolean;
	className?: string;
}

export default function PasswordStrengthIndicator({
	password,
	showFeedback = true,
	className = '',
}: PasswordStrengthIndicatorProps) {
	const result: PasswordStrengthResult = calculatePasswordStrength(password);

	if (!password) {
		return null;
	}

	const { score, feedback, color, strength } = result;

	return (
		<View className={`mt-2 ${className}`}>
			{/* Strength Bars */}
			<View className="flex-row gap-1 mb-2">
				{[0, 1, 2, 3].map((index) => (
					<View
						key={index}
						className="flex-1 h-1.5 rounded-full overflow-hidden"
						style={[
							styles.bar,
							{
								backgroundColor: index < score ? color : '#e5e7eb',
							},
						]}
					/>
				))}
			</View>

			{/* Feedback Text */}
			{showFeedback && (
				<View className="flex-row items-center justify-between">
					<Text
						className="text-sm font-medium capitalize"
						style={{ color }}>
						{strength}
					</Text>
					<Text className="text-xs text-muted-foreground">{feedback}</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	bar: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 1,
		elevation: 1,
	},
});
