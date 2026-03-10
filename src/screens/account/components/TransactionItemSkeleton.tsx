import React, { memo } from 'react';
import { View } from 'react-native';
import { Skeleton } from '../../../components/ui/Skeleton';

const TransactionItemSkeleton = () => {
    return (
        <View className="bg-card rounded-2xl p-4 mb-3 shadow-sm border border-border">
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    {/* Package Name */}
                    <Skeleton className="h-6 w-3/4 rounded mb-1.5" />
                    {/* Date */}
                    <Skeleton className="h-3 w-1/2 rounded" />
                </View>

                {/* Status Badge */}
                <Skeleton className="h-6 w-16 rounded-full" />
            </View>

            <View className="flex-row justify-between items-end pt-2 border-t border-border mt-1">
                <View>
                    {/* Amount Label */}
                    <Skeleton className="h-3 w-12 rounded mb-1" />
                    {/* Amount Value */}
                    <Skeleton className="h-6 w-24 rounded" />
                </View>

                {/* Tokens Received */}
                <View className="items-end">
                    {/* Tokens Label */}
                    <Skeleton className="h-3 w-20 rounded mb-1" />
                    {/* Tokens Value */}
                    <Skeleton className="h-6 w-16 rounded-lg" />
                </View>
            </View>
        </View>
    );
};

export default memo(TransactionItemSkeleton);
