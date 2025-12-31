import { showMessage, MessageOptions } from 'react-native-flash-message';

const defaultOptions: Partial<MessageOptions> = {
	duration: 3000,
	floating: true,
	icon: 'auto',
	style: { borderRadius: 12, alignItems: 'center' },
	titleStyle: { fontFamily: 'System', fontWeight: 'bold' },
};

export const onError = (message: string, description?: string) => {
	showMessage({
		...defaultOptions,
		message: message,
		description: description,
		type: 'danger',
		backgroundColor: '#EF4444',
	});
};

export const onSuccess = (message: string, description?: string) => {
	showMessage({
		...defaultOptions,
		message: message,
		description: description,
		type: 'success',
		backgroundColor: '#10B981',
	});
};

export const onInfo = (message: string, description?: string) => {
	showMessage({
		...defaultOptions,
		message: message,
		description: description,
		type: 'info',
		backgroundColor: '#3B82F6',
	});
};
