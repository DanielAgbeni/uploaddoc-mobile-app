import React, { memo } from 'react';
import { NavigationContainer, NavigationContainerRef, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation.types';
import { linkingConfig } from '../config/linking.config';
import { useUserStore } from '../shared/user-store/useUserStore';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

// Navigators
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
	navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}

function RootNavigator({ navigationRef }: RootNavigatorProps) {
	const isAuthenticated = useUserStore((state) => state.isAuthenticated);
	const hasHydrated = useUserStore((state) => state.hasHydrated);
	const { colors, colorScheme } = useTheme();

	const navigationTheme = colorScheme === 'dark' ? {
		...DarkTheme,
		colors: {
			...DarkTheme.colors,
			background: colors.background,
			card: colors.card,
			text: colors.foreground,
			border: colors.border,
			primary: colors.primary,
		}
	} : {
		...DefaultTheme,
		colors: {
			...DefaultTheme.colors,
			background: colors.background,
			card: colors.card,
			text: colors.foreground,
			border: colors.border,
			primary: colors.primary,
		}
	};

	return (
		<NavigationContainer ref={navigationRef} linking={linkingConfig} theme={navigationTheme}>
			{!hasHydrated ? (
				<View className="flex-1 bg-background items-center justify-center">
					<ActivityIndicator
						size="large"
						color="#1724ab"
					/>
				</View>
			) : (
				<Stack.Navigator
					screenOptions={{
						headerShown: false,
						animation: 'fade',
					}}>
					{isAuthenticated ? (
						<Stack.Screen
							name="Main"
							component={MainTabNavigator}
						/>
					) : (
						<Stack.Screen
							name="Auth"
							component={AuthStack}
						/>
					)}
				</Stack.Navigator>
			)}
		</NavigationContainer>
	);
}
export default memo(RootNavigator);
