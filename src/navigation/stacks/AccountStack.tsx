import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../../types/navigation.types';

// Screens
import ProfileScreen from '../../screens/account/ProfileScreen';
import EditProfileScreen from '../../screens/account/EditProfileScreen';
import TransactionHistoryScreen from '../../screens/account/TransactionHistoryScreen';
import SettingsScreen from '../../screens/account/SettingsScreen';

const Stack = createNativeStackNavigator<AccountStackParamList>();

export default function AccountStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
