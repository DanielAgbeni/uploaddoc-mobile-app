import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VendorsStackParamList } from '../../types/navigation.types';

// Screens
import VendorsListScreen from '../../screens/vendors/VendorsListScreen';
import VendorDetailsScreen from '../../screens/vendors/VendorDetailsScreen';
import SubmitDocumentScreen from '../../screens/documents/SubmitDocumentScreen';

const Stack = createNativeStackNavigator<VendorsStackParamList>();

export default function VendorsStack() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				animation: 'slide_from_bottom',
				contentStyle: { backgroundColor: 'transparent' },
			}}>
			<Stack.Screen
				name="VendorsList"
				component={VendorsListScreen}
			/>
			<Stack.Screen
				name="VendorDetails"
				component={VendorDetailsScreen}
			/>
			<Stack.Screen
				name="SubmitDocument"
				component={SubmitDocumentScreen}
			/>
		</Stack.Navigator>
	);
}
