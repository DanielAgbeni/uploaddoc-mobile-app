import './src/styles/global.css';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/config/queryClient';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/providers/ThemeProvider';
import { ModalProvider } from './src/providers/ModalProvider';
import CustomToastMessageComponent from './src/components/ui/CustomToast';
import FlashMessage from 'react-native-flash-message';

function AppContent() {
	const { colorScheme } = useTheme();

	return (
		<View className={`flex-1 ${colorScheme === 'dark' ? 'dark' : ''}`}>
			<RootNavigator />
			<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
			<FlashMessage
				position="top"
				floating
				MessageComponent={CustomToastMessageComponent}
			/>
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
