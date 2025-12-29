import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DocumentsStackParamList } from '../../types/navigation.types';

// Screens
import DocumentsListScreen from '../../screens/documents/DocumentsListScreen';
import SubmitDocumentScreen from '../../screens/documents/SubmitDocumentScreen';

const Stack = createNativeStackNavigator<DocumentsStackParamList>();

export default function DocumentsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="DocumentsList" component={DocumentsListScreen} />
      <Stack.Screen
        name="SubmitDocument"
        component={SubmitDocumentScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
