import React, { memo, useEffect } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { MainTabParamList } from '../types/navigation.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../providers/ThemeProvider';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';


// Icons
import AccountIcon from '../assets/icons/account.icon';
import SearchIcon from '../assets/icons/search.icon';
import StacksIcon from '../assets/icons/stacks.icon';
import DashboardIcon from '../assets/icons/dashboard.icon';
import PlusIcon from '../assets/icons/add.icon';

// Stack Navigators
import DocumentsStack from './stacks/DocumentsStack';
import VendorsStack from './stacks/VendorsStack';
import AccountStack from './stacks/AccountStack';
import DashboardStack from './stacks/DashboardStack';
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
	const scale = useSharedValue(focused ? 1.15 : 1);

	useEffect(() => {
		scale.value = withSpring(focused ? 1.15 : 1, { damping: 15 });
	}, [focused, scale]);

	const animStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<Animated.View
			className="items-center justify-center rounded-full px-4 py-1.5"
			style={[
				focused ? { backgroundColor: `${primaryColor}1A` } : undefined,
				animStyle,
			]}>
			{children}
		</Animated.View>
	);
});

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
	const user = useUserStore((state) => state.user);
	const isVendor = user?.isAdmin || false; // Using isAdmin as proxy
	const insets = useSafeAreaInsets();
	const { colors, colorScheme } = useTheme();

	const activeColor = colors.primary;
	const inactiveColor =
		colorScheme === 'dark' ? '#94a3b8' : '#64748b';

	return (
		<Tab.Navigator
			screenOptions={({ route }) => {
				const routeName = getFocusedRouteNameFromRoute(route);
				const hideTabBarScreens = [
					'EditProfile',
					'TransactionHistory',
					'Settings',
					'CloudSync',
					'VendorDetails',
					'SubmitDocument',
					'Notifications',
				];
				const shouldHideTabBar = routeName && hideTabBarScreens.includes(routeName);

				return {
					headerShown: false,
					tabBarActiveTintColor: activeColor,
					tabBarInactiveTintColor: inactiveColor,
					tabBarShowLabel: true,
					// @ts-ignore: 'animation' is a valid option in v7
					animation: 'shift',
					// @ts-ignore: sceneStyle is added in v7 to style the background of the screen container
					sceneStyle: { backgroundColor: colors.background },
					tabBarStyle: shouldHideTabBar
						? { display: 'none' }
						: {
								position: 'absolute',
								bottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
								left: 24,
								right: 24,
								paddingHorizontal: 8,
								backgroundColor:
									colorScheme === 'dark'
										? 'rgba(0, 15, 36, 0.85)'
										: 'rgba(235, 244, 255, 0.85)',
								height: 64,
								borderRadius: 24,
								paddingBottom: 0,
								paddingTop: 8,
								borderWidth: 1,
								borderColor:
									colorScheme === 'dark'
										? 'rgba(255, 255, 255, 0.08)'
										: 'rgba(68, 78, 187, 0.1)',
								shadowColor: colors.primary,
								shadowOffset: { width: 0, height: 8 },
								shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.08,
								shadowRadius: 16,
								elevation: 8,
						  },
					tabBarLabelStyle: {
						fontSize: 10,
						fontWeight: '600',
						marginTop: 2,
						marginBottom: 4,
					},
				};
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

			{/* Floating Central Plus Action Button */}
			<Tab.Screen
				name="SubmitTab"
				component={View}
				listeners={({ navigation }) => ({
					tabPress: (e) => {
						e.preventDefault();
						// Navigate nested SubmitDocument within DocumentsTab stack
						navigation.navigate('DocumentsTab', {
							screen: 'SubmitDocument',
							params: {}
						});
					},
				})}
				options={{
					tabBarLabel: () => null,
					tabBarIcon: () => (
						<View
							className="items-center justify-center rounded-full bg-primary"
							style={{
								width: 50,
								height: 50,
								marginTop: -20,
								shadowColor: activeColor,
								shadowOffset: { width: 0, height: 6 },
								shadowOpacity: 0.3,
								shadowRadius: 10,
								elevation: 6,
							}}>
							<PlusIcon
								size={28}
								color="#FFFFFF"
							/>
						</View>
					),
				}}
			/>

			{isVendor && (
				<Tab.Screen
					name="DashboardTab"
					component={DashboardStack}
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
