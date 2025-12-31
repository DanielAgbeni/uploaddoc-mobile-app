import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CustomModal } from './CustomModal';
import { useTheme } from '../../providers/ThemeProvider';

export type AlertType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

interface AlertModalProps {
	isVisible: boolean;
	onClose: () => void;
	title: string;
	message: string;
	type?: AlertType;
	onConfirm?: () => void;
	confirmText?: string;
	cancelText?: string;
	isDestructive?: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
	isVisible,
	onClose,
	title,
	message,
	type = 'info',
	onConfirm,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	isDestructive = false,
}) => {
	const { colorScheme } = useTheme();
	const isDark = colorScheme === 'dark';

	const handleConfirm = () => {
		onConfirm?.();
		onClose();
	};

	return (
		<CustomModal
			isVisible={isVisible}
			onClose={onClose}>
			<View style={styles.content}>
				{/* Title */}
				<Text style={[styles.title, { color: isDark ? '#F9FAFB' : '#111827' }]}>
					{title}
				</Text>

				{/* Message */}
				<Text
					style={[styles.message, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
					{message}
				</Text>

				{/* Buttons */}
				<View style={styles.buttonContainer}>
					{/* Cancel Button (only for confirm type or if needed) */}
					{(type === 'confirm' || type === 'warning') && (
						<Pressable
							onPress={onClose}
							style={({ pressed }) => [
								styles.button,
								styles.cancelButton,
								{ opacity: pressed ? 0.8 : 1 },
								{ backgroundColor: isDark ? '#374151' : '#E5E7EB' },
							]}>
							<Text
								style={[
									styles.buttonText,
									{ color: isDark ? '#E5E7EB' : '#374151' },
								]}>
								{cancelText}
							</Text>
						</Pressable>
					)}

					{/* Confirm/OK Button */}
					<Pressable
						onPress={handleConfirm}
						style={({ pressed }) => [
							styles.button,
							styles.confirmButton,
							{ opacity: pressed ? 0.8 : 1 },
							{
								backgroundColor: isDestructive ? '#EF4444' : '#4F46E5',
							},
						]}>
						<Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
							{confirmText}
						</Text>
					</Pressable>
				</View>
			</View>
		</CustomModal>
	);
};

const styles = StyleSheet.create({
	content: {
		alignItems: 'center',
	},
	title: {
		fontSize: 20,
		fontWeight: '700',
		marginBottom: 12,
		textAlign: 'center',
	},
	message: {
		fontSize: 16,
		marginBottom: 24,
		textAlign: 'center',
		lineHeight: 24,
	},
	buttonContainer: {
		flexDirection: 'row',
		gap: 12,
		width: '100%',
	},
	button: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cancelButton: {
		backgroundColor: '#E5E7EB',
	},
	confirmButton: {
		backgroundColor: '#4F46E5',
	},
	buttonText: {
		fontSize: 16,
		fontWeight: '600',
	},
});
