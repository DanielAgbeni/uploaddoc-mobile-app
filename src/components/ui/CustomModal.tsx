import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '../../providers/ThemeProvider';

interface CustomModalProps {
	isVisible: boolean;
	onClose: () => void;
	children: ReactNode;
	style?: ViewStyle;
	animationIn?: 'fadeIn' | 'slideInUp' | 'zoomIn';
	animationOut?: 'fadeOut' | 'slideOutDown' | 'zoomOut';
}

export const CustomModal: React.FC<CustomModalProps> = ({
	isVisible,
	onClose,
	children,
	style,
	animationIn = 'zoomIn',
	animationOut = 'zoomOut',
}) => {
	const { colorScheme } = useTheme();
	const isDark = colorScheme === 'dark';

	return (
		<Modal
			isVisible={isVisible}
			onBackdropPress={onClose}
			onBackButtonPress={onClose}
			useNativeDriver
			useNativeDriverForBackdrop
			animationIn={animationIn}
			animationOut={animationOut}
			hideModalContentWhileAnimating
			backdropOpacity={0.5}
			backdropColor={isDark ? '#000' : '#000'}
			style={styles.modal}>
			<View
				style={[
					styles.container,
					{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
					style,
				]}>
				{children}
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modal: {
		justifyContent: 'center',
		margin: 20,
	},
	container: {
		borderRadius: 24,
		padding: 24,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 10,
	},
});
