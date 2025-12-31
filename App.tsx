import './src/styles/global.css';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/config/queryClient';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/providers/ThemeProvider';
import { ModalProvider } from './src/providers/ModalProvider';
import FlashMessage from 'react-native-flash-message';

function AppContent() {
	const { colorScheme } = useTheme();

	return (
		<>
			<RootNavigator />
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
			<FlashMessage
				position="top"
				floating
				style={{ marginTop: 20 }}
				titleStyle={{ fontSize: 16, fontWeight: '600' }}
				textStyle={{ fontSize: 14 }}
			/>
		</>
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
