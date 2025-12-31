import React, { useEffect } from 'react';
import {
	View,
	Modal,
	Pressable,
	TouchableWithoutFeedback,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
	runOnJS,
} from 'react-native-reanimated';

interface CustomModalProps {
	isVisible: boolean;
	onClose: () => void;
	children: React.ReactNode;
	width?: number | string;
}

export const CustomModal: React.FC<CustomModalProps> = ({
	isVisible,
	onClose,
	children,
	width = '90%',
}) => {
	const handleClose = () => {
		console.log('CustomModal: Backdrop pressed or RequestClose');
		onClose();
	};

	const opacity = useSharedValue(0);
	const scale = useSharedValue(0.9);

	useEffect(() => {
		if (isVisible) {
			opacity.value = withTiming(1, { duration: 200 });
			scale.value = withSpring(1, { damping: 12 });
		} else {
			opacity.value = withTiming(0, { duration: 200 });
			scale.value = withTiming(0.9, { duration: 200 });
		}
	}, [isVisible]);

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	const modalStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
	}));

	if (!isVisible) return null;

	return (
		<Modal
			transparent
			visible={isVisible}
			animationType="none"
			onRequestClose={handleClose}
			statusBarTranslucent>
			<View className="flex-1 justify-center items-center">
				<TouchableWithoutFeedback onPress={handleClose}>
					<Animated.View
						className="absolute inset-0 bg-black/50"
						style={backdropStyle}
					/>
				</TouchableWithoutFeedback>

				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					className="w-full items-center justify-center"
					pointerEvents="box-none">
					<Animated.View
						style={[modalStyle]}
						className="bg-card rounded-2xl p-6 shadow-xl border border-border">
						{children}
					</Animated.View>
				</KeyboardAvoidingView>
			</View>
		</Modal>
	);
};
