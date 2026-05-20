import React from 'react';
import { View } from 'react-native';
import { Skeleton } from 'src/components/ui/Skeleton';

const VendorCardSkeleton: React.FC = () => {
	return (
		<View className="mb-4 flex-1 overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
			<View className="px-4 py-5">
				<View className="flex-row items-start">
					<Skeleton className="mr-4 h-16 w-16 rounded-full" />

					<View className="min-w-0 flex-1">
						<View className="mb-3 flex-row items-start justify-between gap-3">
							<View className="flex-1">
								<Skeleton className="mb-2 h-6 w-4/5 rounded" />
								<Skeleton className="h-5 w-32 rounded-full" />
							</View>
							<Skeleton className="h-7 w-16 rounded-full" />
						</View>

						<View className="gap-3">
							<View className="flex-row items-center">
								<Skeleton className="mr-3 h-8 w-8 rounded-full" />
								<Skeleton className="h-4 flex-1 rounded" />
							</View>
							<View className="flex-row items-center">
								<Skeleton className="mr-3 h-8 w-8 rounded-full" />
								<Skeleton className="h-4 w-1/2 rounded" />
							</View>
						</View>
					</View>
				</View>
			</View>

			<View className="flex-row items-center justify-between border-t border-border bg-muted/30 px-5 py-4">
				<View>
					<Skeleton className="mb-2 h-3 w-24 rounded" />
					<Skeleton className="h-6 w-20 rounded" />
				</View>
				<Skeleton className="h-11 w-32 rounded-full" />
			</View>
		</View>
	);
};

export default React.memo(VendorCardSkeleton);
