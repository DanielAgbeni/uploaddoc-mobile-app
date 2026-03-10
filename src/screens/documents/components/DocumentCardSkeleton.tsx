import React, { memo } from 'react';
import { View } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';

const DocumentCardSkeleton = () => {
    return (
        <View className="bg-card border border-border rounded-xl p-4 mb-3 shadow-sm mx-4">
            <View className="flex-row items-center gap-4">
                {/* Icon Container block */}
                <Skeleton className="h-12 w-12 rounded-lg" />

                {/* Content */}
                <View className="flex-1 min-w-0 gap-2">
                    <View className="flex-row justify-between items-start">
                        {/* Title block */}
                        <Skeleton className="h-5 w-3/4 rounded" />
                    </View>

                    {/* Metadata block (size, date, pages) */}
                    <View className="flex-row gap-2 mt-1">
                        <Skeleton className="h-3 w-12 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                    </View>

                    <View className="flex-row justify-between items-center mt-3">
                        {/* Status pill */}
                        <Skeleton className="h-6 w-20 rounded-full" />

                        {/* Actions (download, trash) */}
                        <View className="flex-row gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </View>
                    </View>
                </View>
            </View>
            {/* Assigned to section footer */}
            <View className="mt-3 pt-3 border-t border-border flex-row justify-between items-center">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
            </View>
        </View>
    );
};

export default memo(DocumentCardSkeleton);
