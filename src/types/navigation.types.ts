import { NavigatorScreenParams } from '@react-navigation/native';

// Admin/Vendor Types
export interface AdminReview {
	userId: string;
	name: string;
	rating: number;
	comment: string;
	_id: string;
}

export interface AdminDiscountRate {
	minPages: number;
	maxPages: number;
	discount: number;
	_id: string;
}

export interface Admin {
	_id: string;
	id: string;
	name: string;
	email: string;
	matricNumber: string;
	isAdmin: boolean;
	profilePicture: string | null;
	rating: number;
	reviews: AdminReview[];
	adminStatus: string;
	openingHours: string | null;
	printingCost: number | null;
	printingLocation: string | null;
	supportContact: string | null;
	additionalInfo: string | null;
	discountRates: AdminDiscountRate[];
	queueTimeEstimate: number;
	createdAt: string;
}

export interface AdminsPagination {
	totalCount: number;
	totalPages: number;
	currentPage: number;
	limit: number;
}

export interface AdminsResponse {
	success: boolean;
	message: string;
	data: {
		admins: Admin[];
		pagination: AdminsPagination;
	};
}

// Root Stack - handles auth state
export type RootStackParamList = {
	Auth: NavigatorScreenParams<AuthStackParamList>;
	Main: NavigatorScreenParams<MainTabParamList>;
};

// Auth Stack
export type AuthStackParamList = {
	Welcome: undefined;
	SignIn: undefined;
	SignUp: undefined;
	ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
	DocumentsTab: NavigatorScreenParams<DocumentsStackParamList>;
	VendorsTab: NavigatorScreenParams<VendorsStackParamList>;
	DashboardTab: undefined; // Only visible for vendors
	AccountTab: NavigatorScreenParams<AccountStackParamList>;
};

// Documents Stack (nested in Documents Tab)
export type DocumentsStackParamList = {
	DocumentsList: undefined;
	SubmitDocument: {
		vendorId?: string;
		vendorName?: string;
		vendorEmail?: string;
		vendorProfilePicture?: string;
		vendorPrintingCost?: number;
		vendorRating?: number;
		isVendorLocked?: boolean; // True when navigating from Find Vendors or deep link
	};
};

// Vendors Stack (nested in Find Vendors Tab)
export type VendorsStackParamList = {
	VendorsList: undefined;
	VendorDetails: {
		vendorId: string;
	};
};

// Account Stack (nested in Account Tab)
export type AccountStackParamList = {
	Profile: undefined;
	EditProfile: undefined; // Vendor-only
	TransactionHistory: undefined; // Vendor-only
	Settings: undefined;
};

// Navigation prop types for convenience
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

// Root Navigator
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Auth Stack Navigator
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

// Documents Stack Navigator
export type DocumentsStackNavigationProp = CompositeNavigationProp<
	NativeStackNavigationProp<DocumentsStackParamList>,
	BottomTabNavigationProp<MainTabParamList>
>;

// Vendors Stack Navigator
export type VendorsStackNavigationProp = CompositeNavigationProp<
	NativeStackNavigationProp<VendorsStackParamList>,
	BottomTabNavigationProp<MainTabParamList>
>;

// Account Stack Navigator
export type AccountStackNavigationProp = CompositeNavigationProp<
	NativeStackNavigationProp<AccountStackParamList>,
	BottomTabNavigationProp<MainTabParamList>
>;

// Declare global navigation types for TypeScript
declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}
