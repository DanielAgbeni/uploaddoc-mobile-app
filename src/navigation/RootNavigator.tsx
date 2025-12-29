import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation.types';
import { linkingConfig } from '../config/linking.config';

// Navigators
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Mock authentication state - replace with actual auth context/state
const mockAuthState = {
  isAuthenticated: false, // Set to true to see Main tabs
};

export default function RootNavigator() {
  const { isAuthenticated } = mockAuthState;

  return (
    <NavigationContainer linking={linkingConfig}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
