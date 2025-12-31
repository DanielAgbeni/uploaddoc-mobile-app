import React from 'react';
import { View, Text, Pressable } from 'react-native';
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
	const handleConfirm = () => {
		console.log('AlertModal: Confirm button pressed');
		if (onConfirm) {
			console.log('AlertModal: Calling onConfirm prop');
			onConfirm();
		} else {
			console.log('AlertModal: No onConfirm prop provided');
		}
		// onClose();
	};

	return (
		<CustomModal
			isVisible={isVisible}
			onClose={onClose}>
			<View className="items-center">
				{/* Title */}
				<Text className="text-xl font-bold mb-3 text-center text-foreground font-display">
					{title}
				</Text>

				{/* Message */}
				<Text className="text-base mb-6 text-center leading-6 text-muted-foreground font-body">
					{message}
				</Text>

				{/* Buttons */}
				<View className="flex-row gap-3 w-full">
					{/* Cancel Button (only for confirm type or if needed) */}
					{(type === 'confirm' || type === 'warning') && (
						<Pressable
							onPress={onClose}
							className="flex-1 py-3 rounded-xl items-center justify-center bg-muted active:opacity-80">
							<Text className="text-base font-semibold text-foreground font-body">
								{cancelText}
							</Text>
						</Pressable>
					)}

					{/* Confirm/OK Button */}
					<Pressable
						onPress={handleConfirm}
						className={`flex-1 py-3 rounded-xl items-center justify-center active:opacity-80 ${isDestructive ? 'bg-red-500' : 'bg-primary'}`}>
						<Text className="text-base font-semibold text-white font-body">
							{confirmText}
						</Text>
					</Pressable>
				</View>
			</View>
		</CustomModal>
	);
};
