import React, { memo } from 'react';
import { View } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';

const DocumentCardSkeleton = memo(function DocumentCardSkeleton() {
	return (
		<View className="mb-4 rounded-[24px] border border-border bg-card px-5 py-5 shadow-sm">
			<View className="flex-row items-start mb-3">
				<Skeleton className="mr-3 h-10 w-10 rounded-xl" />

				<View className="flex-1 pr-1">
					<Skeleton className="h-5 w-2/3 rounded-lg" />
				</View>

				<Skeleton className="h-6 w-16 rounded-full" />
			</View>

			<View className="mb-3">
				<Skeleton className="h-3.5 w-full rounded-md mb-2" />
				<Skeleton className="h-3.5 w-4/5 rounded-md" />
			</View>

			<View className="mb-4">
				<Skeleton className="h-3 w-1/2 rounded-md" />
			</View>

			<View className="flex-row items-center justify-between border-t border-border pt-4">
				<View className="flex-row items-center flex-1 pr-3">
					<Skeleton className="h-8 w-8 rounded-full mr-2.5" />
					<View className="flex-1">
						<Skeleton className="h-2 w-10 rounded-sm mb-1.5" />
						<Skeleton className="h-3.5 w-20 rounded-md" />
					</View>
				</View>

				<View className="flex-row gap-2">
					<Skeleton className="h-9 w-9 rounded-full" />
					<Skeleton className="h-9 w-9 rounded-full" />
				</View>
			</View>
		</View>
	);
});

export default DocumentCardSkeleton;
