import { NavigatorScreenParams } from '@react-navigation/native';

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
