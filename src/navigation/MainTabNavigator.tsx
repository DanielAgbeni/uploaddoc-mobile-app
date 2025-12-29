import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation.types';
import { Text } from 'react-native';

// Stack Navigators
import DocumentsStack from './stacks/DocumentsStack';
import VendorsStack from './stacks/VendorsStack';
import AccountStack from './stacks/AccountStack';
import DashboardScreen from '../screens/dashboard/DashboardScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Mock user data - replace with actual user state/context
const mockUserData = {
  isVendor: true, // Set to false to hide Dashboard tab
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1724ab', // primary color
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="DocumentsTab"
        component={DocumentsStack}
        options={{
          tabBarLabel: 'Documents',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📄</Text>
          ),
        }}
      />
      
      <Tab.Screen
        name="VendorsTab"
        component={VendorsStack}
        options={{
          tabBarLabel: 'Find Vendors',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🔍</Text>
          ),
        }}
      />

      {/* Conditionally render Dashboard tab only for vendors */}
      {mockUserData.isVendor && (
        <Tab.Screen
          name="DashboardTab"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>📊</Text>
            ),
          }}
        />
      )}

      <Tab.Screen
        name="AccountTab"
        component={AccountStack}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
