import './src/styles/global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/config/queryClient';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/providers/ThemeProvider';
import FlashMessage from 'react-native-flash-message';

function AppContent() {
	const { colorScheme } = useTheme();

	return (
		<>
			<RootNavigator />
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
			<FlashMessage position="top" />
		</>
	);
}

export default function App() {
	return (
		<SafeAreaProvider>
			<ThemeProvider>
				<QueryClientProvider client={queryClient}>
					<AppContent />
				</QueryClientProvider>
			</ThemeProvider>
		</SafeAreaProvider>
	);
}
