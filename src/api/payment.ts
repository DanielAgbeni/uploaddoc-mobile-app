import { getData } from '.';

export const PACKAGES: Record<
	number,
	{
		id: number;
		name: string;
		price: number;
		tokens: number;
		durationDays: number;
	}
> = {
	1: { id: 1, name: 'Basic', price: 0, tokens: 70, durationDays: 90 },
	2: { id: 2, name: 'Standard', price: 2000, tokens: 250, durationDays: 183 },
	3: {
		id: 3,
		name: 'Professional',
		price: 5000,
		tokens: 700,
		durationDays: 183,
	},
	4: {
		id: 4,
		name: 'Enterprise',
		price: 10000,
		tokens: 1500,
		durationDays: 183,
	},
};

export const PAYMENT_ERROR_MESSAGES: Record<string, string> = {
	'Invalid package format': 'Please select a valid package',
	'Invalid package ID': 'This package is not available',
	'User not found': 'Please log in again',
	'Token expired': 'Your session has expired. Please log in.',
	'Payment initialization failed':
		'Unable to process payment. Please try again.',
	'Admins cannot activate the Basic package again.':
		'You have already activated the Basic package.',
};

export const getTransactionHistory = (
	page: number = 1,
	limit: number = 10,
): ApiRequestResponseType<TransactionHistoryResponse> => {
	return getData<TransactionHistoryResponse>(
		`/api/payment/transactions?page=${page}&limit=${limit}`,
	);
};
