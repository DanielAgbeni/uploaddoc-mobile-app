import React, { memo } from 'react';
import { View } from 'react-native';
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

interface TabIconContainerProps {
	focused: boolean;
	primaryColor: string;
	children: React.ReactNode;
}

const TabIconContainer = memo(function TabIconContainer({
	focused,
	primaryColor,
	children,
}: TabIconContainerProps) {
	return (
		<View
			className="items-center justify-center rounded-full px-4 py-1"
			style={focused ? { backgroundColor: `${primaryColor}1A` } : undefined}>
			{children}
		</View>
	);
});

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
	const user = useUserStore((state) => state.user);
	const isVendor = user?.isAdmin || false; // Using isAdmin as proxy; adjust as needed
	const insets = useSafeAreaInsets();
	const { colors, colorScheme } = useTheme();

	const activeColor = colors.primary;
	const inactiveColor =
		colorScheme === 'dark' ? 'rgba(248, 249, 252, 0.4)' : 'rgba(3, 4, 7, 0.4)';

	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: activeColor,
				tabBarInactiveTintColor: inactiveColor,
				tabBarShowLabel: true,
				// @ts-ignore: 'animation' is a valid option in v7 but might not be in the types yet if mismatch
				animation: 'shift', // Adds transition animation between tabs
				// @ts-ignore: sceneStyle is added in v7 to style the background of the screen container
				sceneStyle: { backgroundColor: colors.background },
				tabBarStyle: {
					backgroundColor: colors.background,
					height: 60 + Math.max(insets.bottom, 12),
					paddingBottom: Math.max(insets.bottom, 12),
					paddingTop: 8,
					elevation: 0,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: colorScheme === 'dark' ? 0.15 : 0.03,
					shadowRadius: 8,
					borderTopWidth: 1,
					borderTopColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
				},
				tabBarLabelStyle: {
					fontSize: 11,
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
						<TabIconContainer
							focused={focused}
							primaryColor={activeColor}>
							<StacksIcon
								size={20}
								color={color}
							/>
						</TabIconContainer>
					),
				}}
			/>

			<Tab.Screen
				name="VendorsTab"
				component={VendorsStack}
				options={{
					tabBarLabel: 'Find Vendor',
					tabBarIcon: ({ color, focused }) => (
						<TabIconContainer
							focused={focused}
							primaryColor={activeColor}>
							<SearchIcon
								size={20}
								color={color}
							/>
						</TabIconContainer>
					),
				}}
			/>

			{isVendor && (
				<Tab.Screen
					name="DashboardTab"
					component={DashboardScreen}
					options={{
						tabBarLabel: 'Dashboard',
						tabBarIcon: ({ color, focused }) => (
							<TabIconContainer
								focused={focused}
								primaryColor={activeColor}>
								<DashboardIcon
									size={20}
									color={color}
								/>
							</TabIconContainer>
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
						<TabIconContainer
							focused={focused}
							primaryColor={activeColor}>
							<AccountIcon
								size={20}
								color={color}
							/>
						</TabIconContainer>
					),
				}}
			/>
		</Tab.Navigator>
	);
}

export default memo(MainTabNavigator);
