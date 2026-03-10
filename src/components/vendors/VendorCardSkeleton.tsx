import React from 'react';
import { View } from 'react-native';
import { Skeleton } from 'src/components/ui/Skeleton';

const VendorCardSkeleton: React.FC = () => {
    return (
        <View className="bg-card border border-border rounded-3xl overflow-hidden shadow-md mb-5 mx-1">
            <View className="p-5">
                {/* Header: Avatar, Name, Status */}
                <View className="flex-row items-center gap-4">
                    {/* Profile Picture */}
                    <Skeleton className="h-16 w-16 rounded-full" />

                    {/* Name & Basic Meta */}
                    <View className="flex-1 justify-center">
                        <View className="flex-row justify-between items-start">
                            <View className="flex-1 mr-2">
                                <Skeleton className="h-6 w-3/4 rounded mb-2" />
                                {/* Status Text Badge */}
                                <Skeleton className="h-5 w-20 rounded-md" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Divider */}
                <View className="h-[1px] bg-border my-4" />

                {/* Info Rows - Compact & Aligned */}
                <View className="space-y-3">
                    {/* Email */}
                    <View className="flex-row items-center">
                        <Skeleton className="h-4 w-4 rounded-full mr-3" />
                        <Skeleton className="h-4 w-2/3 rounded" />
                    </View>

                    {/* Location */}
                    <View className="flex-row items-center">
                        <Skeleton className="h-4 w-4 rounded-full mr-3" />
                        <Skeleton className="h-4 w-full rounded" />
                    </View>

                    {/* Phone */}
                    <View className="flex-row items-center">
                        <Skeleton className="h-4 w-4 rounded-full mr-3" />
                        <Skeleton className="h-4 w-1/2 rounded" />
                    </View>
                </View>
            </View>

            {/* Highlighted Footer Action Area */}
            <View className="bg-muted/30 px-5 py-4 flex-row items-center justify-between border-t border-border">
                <View>
                    <Skeleton className="h-3 w-24 rounded mb-2" />
                    <Skeleton className="h-6 w-16 rounded" />
                </View>

                {/* Select Button */}
                <Skeleton className="h-10 w-24 rounded-full" />
            </View>
        </View>
    );
};

export default React.memo(VendorCardSkeleton);
