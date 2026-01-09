import React, { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation.types';

// Screens
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();
function AuthStack() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				animation: 'slide_from_right',
				contentStyle: { backgroundColor: 'transparent' },
			}}>
			<Stack.Screen
				name="Welcome"
				component={OnboardingScreen}
			/>
			<Stack.Screen
				name="SignIn"
				component={SignInScreen}
			/>
			<Stack.Screen
				name="SignUp"
				component={SignUpScreen}
			/>
			<Stack.Screen
				name="ForgotPassword"
				component={ForgotPasswordScreen}
			/>
		</Stack.Navigator>
	);
}

export default memo(AuthStack);
