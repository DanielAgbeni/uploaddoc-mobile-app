import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Custom hook to refetch data when the screen comes into focus.
 * This provides a "subtle" update mechanism without full loading states if configured correctly.
 *
 * @param refetch - The refetch function from useQuery/useInfiniteQuery
 */
export function useRefreshOnFocus<T>(refetch: () => Promise<T>) {
	const firstTimeRef = useRef(true);

	useFocusEffect(
		useCallback(() => {
			if (firstTimeRef.current) {
				firstTimeRef.current = false;
				return;
			}

			refetch();
		}, [refetch]),
	);
}
