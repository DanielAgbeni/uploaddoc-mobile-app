import React, { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../../types/navigation.types';

// Screens
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import NotificationsScreen from '../../screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

function DashboardStack() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				animation: 'slide_from_right',
				contentStyle: { backgroundColor: 'transparent' },
			}}>
			<Stack.Screen
				name="Dashboard"
				component={DashboardScreen}
			/>
			<Stack.Screen
				name="Notifications"
				component={NotificationsScreen}
			/>
		</Stack.Navigator>
	);
}

export default memo(DashboardStack);
