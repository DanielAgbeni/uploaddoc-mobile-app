import { QueryClient } from '@tanstack/react-query';

// Configure QueryClient with default options
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Data will be considered stale after 5 minutes
			staleTime: 5 * 60 * 1000,
			// Cache data for 10 minutes
			gcTime: 10 * 60 * 1000,
			// Retry failed requests twice
			retry: 2,
			// Don't refetch on window focus in development
			refetchOnWindowFocus: __DEV__ ? false : true,
			// Refetch on reconnect
			refetchOnReconnect: true,
		},
		mutations: {
			// Retry failed mutations once
			retry: 1,
		},
	},
});

/*
  This code sets up the focus manager for React Query to handle app state changes.
  When the app goes from background to active, it signals the focus manager to refetch queries.
*/
import { AppState, AppStateStatus, Platform } from 'react-native';
import { focusManager } from '@tanstack/react-query';

function onAppStateChange(status: AppStateStatus) {
	if (Platform.OS !== 'web') {
		focusManager.setFocused(status === 'active');
	}
}

const subscription = AppState.addEventListener('change', onAppStateChange);
