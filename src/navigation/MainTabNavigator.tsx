import React, { memo, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../types/navigation.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../providers/ThemeProvider';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

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

// --- Tab Icon Container -------------------------------------------------

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

// --- Floating Submit FAB ------------------------------------------------

const SubmitFAB = memo(function SubmitFAB({
	bottomOffset,
	primaryColor,
}: {
	bottomOffset: number;
	primaryColor: string;
}) {
	const navigation = useNavigation<any>();
	const scale = useSharedValue(1);

	const handlePress = useCallback(() => {
		navigation.navigate('DocumentsTab', {
			screen: 'SubmitDocument',
			params: {},
		});
	}, [navigation]);

	// onBegin / onFinalize run on the UI thread (worklet) for smooth animation.
	// runOnJS bridges the tap end to the JS thread for React Navigation.
	const gesture = Gesture.Tap()
		.onBegin(() => {
			scale.value = withSpring(0.88, { damping: 12, stiffness: 300 });
		})
		.onFinalize(() => {
			scale.value = withSpring(1, { damping: 12, stiffness: 300 });
		})
		.onEnd(() => {
			runOnJS(handlePress)();
		});

	const fabStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<GestureDetector gesture={gesture}>
			<Animated.View
				style={[
					styles.fab,
					fabStyle,
					{
						bottom: bottomOffset,
						backgroundColor: primaryColor,
						shadowColor: primaryColor,
					},
				]}>
				<PlusIcon size={26} color="#FFFFFF" />
			</Animated.View>
		</GestureDetector>
	);
});

// --- Tab Navigator ------------------------------------------------------

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
	const user = useUserStore((state) => state.user);
	const isVendor = user?.isAdmin || false;
	const insets = useSafeAreaInsets();
	const { colors, colorScheme } = useTheme();

	const activeColor = colors.primary;
	const inactiveColor = colorScheme === 'dark' ? '#94a3b8' : '#64748b';

	// FAB sits 12 pt above the top of the tab bar
	const tabBarBottom = insets.bottom > 0 ? insets.bottom + 8 : 16;
	const fabBottom = tabBarBottom + 64 + 12;

	return (
		<View style={styles.container}>
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
					const shouldHideTabBar =
						routeName && hideTabBarScreens.includes(routeName);

					return {
						headerShown: false,
						tabBarActiveTintColor: activeColor,
						tabBarInactiveTintColor: inactiveColor,
						tabBarShowLabel: true,
						// @ts-ignore: animation is valid in v7
						animation: 'shift',
						// @ts-ignore: sceneStyle is valid in v7
						sceneStyle: { backgroundColor: colors.background },
						tabBarStyle: shouldHideTabBar
							? { display: 'none' }
							: {
									position: 'absolute',
									bottom: tabBarBottom,
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
							<TabIconContainer focused={focused} primaryColor={activeColor}>
								<StacksIcon size={20} color={color} />
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
							<TabIconContainer focused={focused} primaryColor={activeColor}>
								<SearchIcon size={20} color={color} />
							</TabIconContainer>
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
								<TabIconContainer focused={focused} primaryColor={activeColor}>
									<DashboardIcon size={20} color={color} />
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
							<TabIconContainer focused={focused} primaryColor={activeColor}>
								<AccountIcon size={20} color={color} />
							</TabIconContainer>
						),
					}}
				/>
			</Tab.Navigator>

			{/* Detached FAB — rendered as a sibling to Tab.Navigator, no slot reserved */}
			<SubmitFAB bottomOffset={fabBottom} primaryColor={activeColor} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	fab: {
		position: 'absolute',
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.35,
		shadowRadius: 14,
		elevation: 10,
	},
});

export default memo(MainTabNavigator);
