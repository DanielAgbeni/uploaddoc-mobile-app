import React, { memo } from 'react';
import { View } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';

const ProjectCardSkeleton = () => {
	return (
		<View className="bg-card border border-border rounded-[24px] overflow-hidden shadow-sm mb-4 mx-4">
			<View className="p-4 flex-row gap-4">
				{/* Thumbnail */}
				<Skeleton className="h-14 w-14 rounded-2xl" />

				{/* Content */}
				<View className="flex-1 min-w-0 justify-between py-0.5">
					<View>
						<View className="flex-row items-start justify-between">
							{/* Title */}
							<Skeleton className="h-5 w-1/2 rounded mb-1" />

							{/* Status Badge */}
							<Skeleton className="h-5 w-16 rounded-full" />
						</View>

						{/* Student Info */}
						<Skeleton className="h-3 w-3/4 rounded mt-1" />
					</View>

					<View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
						{/* Category Badge */}
						<Skeleton className="h-5 w-16 rounded-md" />
						{/* Size & Pages */}
						<Skeleton className="h-3 w-10 rounded" />
						<Skeleton className="h-3 w-10 rounded" />
					</View>
				</View>
			</View>

			{/* Footer / Actions */}
			<View className="px-4 py-3 bg-muted/10 border-t border-border flex-row items-center justify-between">
				{/* Cloud Sync Status */}
				<View className="flex-1 mr-4">
					<View className="flex-row items-center gap-1.5">
						<Skeleton className="h-4 w-4 rounded-full" />
						<Skeleton className="h-3 w-16 rounded" />
					</View>
				</View>

				{/* Action Buttons */}
				<View className="flex-row items-center gap-2">
					<Skeleton className="h-10 w-10 rounded-full" />
					<Skeleton className="h-10 w-10 rounded-full" />
					<Skeleton className="h-10 w-10 rounded-full" />
				</View>
			</View>
		</View>
	);
};

export default memo(ProjectCardSkeleton);
