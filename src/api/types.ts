import { AxiosError, AxiosResponse } from 'axios';

declare global {
	export type MetaType = {
		nextLink: string | null;
		previousLink: string | null;
		presentLink: string | null;
	};

	export type PaginationType = {
		presentPage: number;
		total: number;
		limit: number;
		previousPage: number | null;
		nextPage: number | null;
		totalPage: number;
	};

	export type ResultPaginationType = {
		meta: MetaType;
		pagination: PaginationType;
	};

	export type AuthDetailsType = {
		type: 'Bearer';
		token: string;
	};

	export type UserDetailsType = {
		_id: string;
		id: string;
		name: string;
		email: string;
		matricNumber: string;
		profilePicture: string | null;
		isAdmin: boolean;
		isVerified: boolean;
		documentToken: number;
		documentsReceived: number;
		storageUsed: number;
		storageLimit: number;
		storageExpiry: string | null;
		lastLogin: string | null;
		createdAt: string;
		updatedAt: string;
		// Admin-specific fields (optional)
		openingHours?: string;
		printingCost?: any;
		printingLocation?: string;
		supportContact?: string;
		additionalInfo?: string;
		discountRates?: any[];
		rating?: number;
		reviews?: any[];
		adminStatus?: string;
		queueTimeEstimate?: number;
		slug?: string;
		// Google Drive integration
		googleDrive?: {
			connected: boolean;
			driveEmail: string | null;
			connectedAt: string | null;
			autoSync: boolean;
		};
	};

	export type LoginResponseDataType = {
		token: string;
		refreshToken: string;
		expiresAt: string;
		user: UserDetailsType;
	};

	export type LoginResponseType = {
		success: boolean;
		message: string;
		data: LoginResponseDataType;
	};

	export type LoginPayloadType = {
		email: string;
		password?: string;
	};

	export type ResetPasswordPayloadType = {
		email: string;
		otp: string;
		newPassword: string;
	};

	export type RegisterPayloadType = {
		name: string;
		email: string;
		matricNumber: string;
		password?: string;
	};

	export type RegisterResponseDataType = {
		email: string;
		canResend: boolean;
	};

	export type RegisterResponseType = {
		success: boolean;
		message: string;
		data: RegisterResponseDataType;
	};

	export type VerifyEmailPayloadType = {
		email: string;
		otp: string;
	};

	export type VerifyEmailResponseType = LoginResponseType;

	export type ApiCallResponseType<T> = {
		data: T;
	} & ResultPaginationType;

	export type ErrorResponseType = {
		message?: string;
		errors?: {
			[name: string]: string;
		};
	};

	export type ApiRequestResponseType<T> = Promise<AxiosResponse<T>>;

	export type ApiErrorResponseType = AxiosError<ErrorResponseType>;

	export type Project = {
		_id: string;
		studentId: string;
		studentName: string;
		matricNumber: string;
		title: string;
		description: string;
		assignedAdmin: string;
		assignedAdminName?: string;
		status: 'pending' | 'accepted' | 'rejected';
		fileUrl?: string;
		fileType: string;
		fileSize: number;
		pageCount: number;
		price: number;
		discountPercentage: number;
		storageExpiry: string;
		acceptedAt: string | null;
		rejectedAt: string | null;
		filePreview: string | null;
		previewPublicId: string | null;
		fileCategory: 'document' | 'image' | 'spreadsheet' | 'presentation' | 'design' | 'other';
		pendingExpiry: string;
		createdAt: string;
		updatedAt: string;
		// Google Drive sync info
		driveSync?: {
			synced: boolean;
			driveFileId: string | null;
			driveFileUrl: string | null;
			syncedAt: string | null;
			syncError: string | null;
		};
	};

	export type ProjectsResponse = {
		success: boolean;
		message: string;
		data: {
			projects: Project[];
			pagination: {
				totalCount: number;
				totalPages: number;
				currentPage: number;
				limit: number;
			};
		};
	};
	export type UserStatusType = {
		_id: string;
		id: string;
		name: string;
		email: string;
		matricNumber: string;
		profilePicture: string | null;
		isAdmin: boolean;
		isVerified: boolean;
		documentToken: number;
		documentsReceived: number;
		storageUsed: number;
		storageLimit: number;
		storageExpiry: string | null;
		lastLogin: string | null;
		openingHours: string;
		printingCost: number | null;
		printingLocation: string;
		supportContact: string;
		additionalInfo: string;
		discountRates: any[];
		rating: number;
		reviews: any[];
		adminStatus: string;
		queueTimeEstimate: number;
		slug?: string;
	};

	export type UserStatusResponse = {
		success: boolean;
		message: string;
		data: {
			token: string;
			user: UserStatusType;
		};
	};
	export type Log = {
		_id: string;
		user: {
			_id: string;
			name: string;
			email: string;
		};
		action: string;
		details: string;
		createdAt: string;
		updatedAt: string;
		__v: number;
	};

	export type LogsResponse = {
		totalLogs: number;
		currentPage: number;
		totalPages: number;
		logs: Log[];
	};

	// Payment Types
	export type InitializePaymentPayload = {
		userId: string;
		package: number; // 1-4
	};

	export type InitializePaymentResponse = {
		status: 'success';
		data: {
			authorization_url?: string; // For paid packages
			message?: string; // For free package
			redirectUrl?: string; // For free package
		};
	};

	export type PaymentDetails = {
		reference: string;
		status: 'pending' | 'completed' | 'failed';
		amount: number;
		packageId: number;
		tokensAdded: number;
		storageAdded: number;
		createdAt: string;
	};

	export type PaymentDetailsResponse = {
		success: boolean;
		data: PaymentDetails;
	};

	export type Transaction = {
		_id: string;
		userId: string;
		username: string;
		email: string;
		packageId: number;
		amount: number;
		reference: string;
		status: 'pending' | 'completed' | 'failed';
		createdAt: string;
		updatedAt: string;
		tokensAdded: number;
		storageAdded: number;
	};

	export type TransactionHistoryResponse = {
		success: boolean;
		data: {
			transactions: Transaction[];
			pagination: {
				totalCount: number;
				totalPages: number;
				currentPage: number;
				limit: number;
			};
		};
	};

	export type PackageInfo = {
		id: number;
		name: string;
		price: number;
		tokens: number;
		durationDays: number;
	};
}

export {};
