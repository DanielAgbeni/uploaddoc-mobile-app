import React, { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DocumentsStackParamList } from '../../types/navigation.types';

// Screens
import DocumentsListScreen from '../../screens/documents/DocumentsListScreen';
import SubmitDocumentScreen from '../../screens/documents/SubmitDocumentScreen';
import NotificationsScreen from '../../screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator<DocumentsStackParamList>();

function DocumentsStack() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				animation: 'slide_from_bottom',
				contentStyle: { backgroundColor: 'transparent' },
			}}>
			<Stack.Screen
				name="DocumentsList"
				component={DocumentsListScreen}
			/>
			<Stack.Screen
				name="SubmitDocument"
				component={SubmitDocumentScreen}
				options={{
					presentation: 'modal',
				}}
			/>
			<Stack.Screen
				name="Notifications"
				component={NotificationsScreen}
				options={{
					animation: 'slide_from_right',
				}}
			/>
		</Stack.Navigator>
	);
}
export default memo(DocumentsStack);
