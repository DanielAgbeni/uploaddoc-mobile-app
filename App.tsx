import './src/styles/global.css';
import React, { useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainerRef } from '@react-navigation/native';
import { queryClient } from './src/config/queryClient';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/providers/ThemeProvider';
import { ModalProvider } from './src/providers/ModalProvider';
import { NotificationProvider } from './src/providers/NotificationProvider';
import CustomToastMessageComponent from './src/components/ui/CustomToast';
import FlashMessage from 'react-native-flash-message';
import type { RootStackParamList } from './src/types/navigation.types';
import { useShareIntent } from './src/hooks/useShareIntent';

function AppContent() {
	const { colorScheme } = useTheme();
	const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

	// Handle incoming file shares from other apps — navigates to SubmitDocumentScreen
	useShareIntent(navigationRef);

	return (
		<View className={`flex-1 ${colorScheme === 'dark' ? 'dark' : ''}`}>
			<NotificationProvider navigationRef={navigationRef}>
				<RootNavigator navigationRef={navigationRef} />
				<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
				<FlashMessage
					position="top"
					floating
					MessageComponent={CustomToastMessageComponent}
				/>
			</NotificationProvider>
		</View>
	);
}

export default function App() {
	return (
		<SafeAreaProvider>
			<ThemeProvider>
				<QueryClientProvider client={queryClient}>
					<ModalProvider>
						<AppContent />
					</ModalProvider>
				</QueryClientProvider>
			</ThemeProvider>
		</SafeAreaProvider>
	);
}
