import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertModal, AlertType } from '../components/ui/AlertModal';

interface ModalOptions {
	title: string;
	message: string;
	type?: AlertType;
	confirmText?: string;
	cancelText?: string;
	isDestructive?: boolean;
	onConfirm?: () => void;
	onCancel?: () => void;
}

interface ModalContextType {
	showAlert: (options: ModalOptions) => void;
	hideAlert: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [isVisible, setIsVisible] = useState(false);
	const [options, setOptions] = useState<ModalOptions | null>(null);

	const showAlert = (newOptions: ModalOptions) => {
		setOptions(newOptions);
		setIsVisible(true);
	};

	const hideAlert = () => {
		setIsVisible(false);
		// Clear options after animation to prevent flickering
		setTimeout(() => setOptions(null), 300);
	};

	const handleConfirm = () => {
		options?.onConfirm?.();
		hideAlert();
	};

	const handleClose = () => {
		options?.onCancel?.();
		hideAlert();
	};

	return (
		<ModalContext.Provider value={{ showAlert, hideAlert }}>
			{children}
			{options && (
				<AlertModal
					isVisible={isVisible}
					onClose={handleClose}
					title={options.title}
					message={options.message}
					type={options.type}
					confirmText={options.confirmText}
					cancelText={options.cancelText}
					isDestructive={options.isDestructive}
					onConfirm={handleConfirm}
				/>
			)}
		</ModalContext.Provider>
	);
};

export const useModal = () => {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error('useModal must be used within a ModalProvider');
	}
	return context;
};
