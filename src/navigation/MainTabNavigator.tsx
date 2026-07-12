import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../types/navigation.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../providers/ThemeProvider';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';

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

// Screens that hide the tab bar — also drives FAB visibility
const HIDE_SCREENS = [
	'EditProfile',
	'TransactionHistory',
	'Settings',
	'CloudSync',
	'VendorDetails',
	'SubmitDocument',
	'Notifications',
];

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

interface SubmitFABProps {
	bottomOffset: number;
	primaryColor: string;
	/** Shared value (0-1) that drives the fade animation. */
	opacity: Animated.SharedValue<number>;
	/** When false the Pressable blocks touches even while fading. */
	interactive: boolean;
}

const SubmitFAB = memo(function SubmitFAB({
	bottomOffset,
	primaryColor,
	opacity,
	interactive,
}: SubmitFABProps) {
	// SubmitFAB is outside Tab.Navigator so useNavigation() returns the Root
	// Stack context (screens: Auth | Main). Navigate to 'Main' with nested
	// params — React Navigation delegates into the Tab → Stack navigators.
	const navigation = useNavigation<any>();
	const scale = useSharedValue(1);

	const handlePressIn = useCallback(() => {
		scale.value = withSpring(0.88, { damping: 12, stiffness: 300 });
	}, [scale]);

	const handlePressOut = useCallback(() => {
		scale.value = withSpring(1, { damping: 12, stiffness: 300 });
	}, [scale]);

	const handlePress = useCallback(() => {
		navigation.navigate('Main', {
			screen: 'DocumentsTab',
			params: {
				screen: 'SubmitDocument',
				params: {},
			},
		} as any);
	}, [navigation]);

	const fabStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
	}));

	return (
		// pointerEvents blocks touches immediately; opacity animates smoothly.
		// This keeps the fade-out animation playing while preventing ghost taps.
		<Pressable
			onPress={handlePress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			pointerEvents={interactive ? 'auto' : 'none'}
			style={[styles.fabContainer, { bottom: bottomOffset }]}>
			<Animated.View
				style={[
					styles.fab,
					fabStyle,
					{
						backgroundColor: primaryColor,
						shadowColor: primaryColor,
					},
				]}>
				<PlusIcon size={26} color="#FFFFFF" />
			</Animated.View>
		</Pressable>
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

	// FAB sits 12 pt above the tab bar
	const tabBarBottom = insets.bottom > 0 ? insets.bottom + 8 : 16;
	const fabBottom = tabBarBottom + 64 + 12;

	// Track the currently focused tab via a ref (no re-renders, no stale closures).
	// 'state' events fire for ALL tab screen listeners on every navigation change,
	// so we guard against other tabs incorrectly triggering FAB visibility updates.
	const activeTabRef = useRef<string>('DocumentsTab');
	const [fabInteractive, setFabInteractive] = useState(true);
	const fabOpacity = useSharedValue(1);

	const setFABVisible = useCallback(
		(visible: boolean) => {
			setFabInteractive(visible);
			fabOpacity.value = withTiming(visible ? 1 : 0, { duration: 180 });
		},
		[fabOpacity],
	);

	const handleTabFocus = useCallback(
		(routeName: string, route: any) => {
			activeTabRef.current = routeName;
			if (routeName !== 'DocumentsTab') {
				setFABVisible(false);
				return;
			}
			// On DocumentsTab focus, also check if we're inside a sub-screen
			const nestedName = getFocusedRouteNameFromRoute(route);
			setFABVisible(!nestedName || !HIDE_SCREENS.includes(nestedName));
		},
		[setFABVisible],
	);

	const handleTabState = useCallback(
		(routeName: string, route: any) => {
			// Guard: only react when the state change belongs to the active tab
			if (routeName !== activeTabRef.current) return;
			if (routeName !== 'DocumentsTab') return;

			const nestedName = getFocusedRouteNameFromRoute(route);
			setFABVisible(!nestedName || !HIDE_SCREENS.includes(nestedName));
		},
		[setFABVisible],
	);

	return (
		<View style={styles.container}>
			<Tab.Navigator
				screenListeners={({ route }) => ({
					// Fires when the user switches to this tab
					focus: () => handleTabFocus(route.name, route),
					// Fires when nested navigation state changes within this tab's stack
					state: () => handleTabState(route.name, route),
				})}
				screenOptions={({ route }) => {
					const routeName = getFocusedRouteNameFromRoute(route);
					const shouldHideTabBar = routeName && HIDE_SCREENS.includes(routeName);

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

			{/* Always rendered — opacity + pointerEvents control visibility/touch */}
			<SubmitFAB
				bottomOffset={fabBottom}
				primaryColor={activeColor}
				opacity={fabOpacity}
				interactive={fabInteractive}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	// Pressable owns the absolute position + hit area
	fabContainer: {
		position: 'absolute',
		right: 24,
		width: 56,
		height: 56,
		zIndex: 999,
		elevation: 10,
	},
	// Animated.View owns the visual shape + shadow
	fab: {
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