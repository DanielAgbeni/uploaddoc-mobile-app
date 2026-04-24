import React, { memo } from 'react';
import { View } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';

const DocumentCardSkeleton = memo(function DocumentCardSkeleton() {
	return (
		<View className="mb-4 rounded-[28px] border border-border bg-card px-4 py-4 shadow-sm">
			<View className="flex-row items-start">
				<Skeleton className="mr-4 h-14 w-14 rounded-[20px]" />

				<View className="flex-1">
					<View className="mb-3 flex-row items-start justify-between gap-3">
						<View className="flex-1">
							<Skeleton className="h-6 w-2/3 rounded-lg" />
							<Skeleton className="mt-3 h-4 w-full rounded-lg" />
							<Skeleton className="mt-2 h-4 w-4/5 rounded-lg" />
						</View>

						<Skeleton className="h-9 w-24 rounded-full" />
					</View>

					<View className="mb-4 flex-row flex-wrap gap-2">
						<Skeleton className="h-8 w-20 rounded-full" />
						<Skeleton className="h-8 w-24 rounded-full" />
						<Skeleton className="h-8 w-16 rounded-full" />
					</View>

					<View className="flex-row items-center justify-between border-t border-border pt-4">
						<View className="flex-1 pr-3">
							<Skeleton className="h-3 w-20 rounded-md" />
							<Skeleton className="mt-2 h-4 w-28 rounded-md" />
						</View>

						<View className="flex-row gap-2">
							<Skeleton className="h-11 w-11 rounded-full" />
							<Skeleton className="h-11 w-11 rounded-full" />
						</View>
					</View>
				</View>
			</View>
		</View>
	);
});

export default DocumentCardSkeleton;
