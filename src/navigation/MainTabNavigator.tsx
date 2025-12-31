import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../providers/ThemeProvider';

// Icons
import AccountIcon from '../assets/icons/account.icon';
import SearchIcon from '../assets/icons/search.icon';
import StacksIcon from '../assets/icons/stacks.icon';
import DashboardIcon from '../assets/icons/dashboard.icon';

// Stack Navigators
import DocumentsStack from './stacks/DocumentsStack';
import VendorsStack from './stacks/VendorsStack';
import AccountStack from './stacks/AccountStack';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import { useUserStore } from '../shared/user-store/useUserStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
	const user = useUserStore((state) => state.user);
	const isVendor = user?.isAdmin || false; // Using isAdmin as proxy; adjust as needed
	const insets = useSafeAreaInsets();

	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: '#1724ab', // Primary Blue
				tabBarInactiveTintColor: '#6B7280',
				tabBarShowLabel: true,
				// @ts-ignore: 'animation' is a valid option in v7 but might not be in the types yet if mismatch
				animation: 'shift', // Adds transition animation between tabs
				tabBarStyle: {
					backgroundColor: '#FFFFFF',
					borderTopWidth: 1,
					borderTopColor: '#E5E7EB',
					height: Platform.OS === 'ios' ? 60 + insets.bottom : 70,
					paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12,
					paddingTop: 8,
					elevation: 0, // Android shadow
					shadowColor: '#000', // iOS shadow
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: 0.05,
					shadowRadius: 4,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: '600',
					marginTop: 4,
				},
			}}>
			<Tab.Screen
				name="DocumentsTab"
				component={DocumentsStack}
				options={{
					tabBarLabel: 'Documents',
					tabBarIcon: ({ color, focused }) => (
						<StacksIcon
							size={24}
							color={color}
						/>
					),
				}}
			/>

			<Tab.Screen
				name="VendorsTab"
				component={VendorsStack}
				options={{
					tabBarLabel: 'Find Provider',
					tabBarIcon: ({ color, focused }) => (
						<SearchIcon
							size={24}
							color={color}
						/>
					),
				}}
			/>

			{/* Showing Dashboard for everyone for now or based on isVendor logic */}
			{isVendor && (
				<Tab.Screen
					name="DashboardTab"
					component={DashboardScreen}
					options={{
						tabBarLabel: 'Dashboard',
						tabBarIcon: ({ color, focused }) => (
							<DashboardIcon
								size={24}
								color={color}
							/>
						),
					}}
				/>
			)}

			<Tab.Screen
				name="AccountTab"
				component={AccountStack}
				options={{
					tabBarLabel: 'Account',
					tabBarIcon: ({ color, focused }) => (
						<AccountIcon
							size={24}
							color={color}
						/>
					),
				}}
			/>
		</Tab.Navigator>
	);
}
