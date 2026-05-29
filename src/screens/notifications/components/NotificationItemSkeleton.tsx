import React, { memo } from 'react';
import { View } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';

const NotificationItemSkeleton = memo(function NotificationItemSkeleton() {
	return (
		<View className="flex-row items-start px-5 py-4 gap-3 border-b border-border/30">
			{/* Icon circle */}
			<Skeleton className="h-10 w-10 rounded-full" />

			{/* Content */}
			<View className="flex-1 gap-2">
				<Skeleton className="h-4 w-3/4 rounded-md" />
				<Skeleton className="h-3 w-full rounded-md" />
				<Skeleton className="h-3 w-1/3 rounded-md" />
			</View>
		</View>
	);
});

export default NotificationItemSkeleton;
