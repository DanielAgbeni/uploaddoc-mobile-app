import React, { useState, useCallback } from 'react';
import {
	View,
	TextInput,
	FlatList,
	ActivityIndicator,
	RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { LinearGradient } from 'expo-linear-gradient';

import {
	VendorsStackParamList,
	MainTabParamList,
	Admin,
} from '../../types/navigation.types';
import { fetchAdmins } from '../../api/admins';
import { useTheme } from '../../providers/ThemeProvider';
import { TextComponent } from 'src/components';
import { SearchIcon, StacksIcon } from 'src/assets/icons';
import VendorCard from 'src/components/vendors/VendorCard';
import VendorCardSkeleton from 'src/components/vendors/VendorCardSkeleton';

type NavigationProp = NativeStackScreenProps<
	VendorsStackParamList,
	'VendorsList'
>['navigation'];

type Props = {
	navigation: NavigationProp;
	route: NativeStackScreenProps<VendorsStackParamList, 'VendorsList'>['route'];
};

export default function VendorsListScreen({ navigation }: Props) {
	const { colors } = useTheme();
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');

	// Debounce search
	const debouncedSearch = useDebouncedCallback((query: string) => {
		setDebouncedQuery(query);
	}, 500);

	const handleSearchChange = (query: string) => {
		setSearchQuery(query);
		debouncedSearch(query);
	};

	// Infinite query for admins
	const {
		data,
		isLoading,
		isError,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isRefetching,
	} = useInfiniteQuery({
		queryKey: ['admins', debouncedQuery],
		queryFn: async ({ pageParam = 1 }) => {
			return fetchAdmins({ page: pageParam, limit: 12, query: debouncedQuery });
		},
		getNextPageParam: (lastPage) => {
			const { currentPage, totalPages } = lastPage.data.pagination;
			return currentPage < totalPages ? currentPage + 1 : undefined;
		},
		initialPageParam: 1,
	});

	// Flatten all pages into a single array
	const admins: Admin[] = data?.pages.flatMap((page) => page.data.admins) ?? [];

	// Handle vendor selection
	const handleSelectVendor = useCallback(
		(admin: Admin) => {
			navigation.navigate('SubmitDocument', {
				vendorId: admin._id,
				vendorName: admin.name,
				vendorEmail: admin.email,
				vendorProfilePicture: admin.profilePicture ?? undefined,
				vendorPrintingCost: admin.printingCost ?? undefined,
				vendorRating: admin.rating,
				isVendorLocked: true,
			});
		},
		[navigation],
	);

	// Handle end reached for infinite scroll
	const handleEndReached = () => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	};

	// Render vendor card
	const renderVendor = useCallback(
		({ item }: { item: Admin }) => (
			<VendorCard
				admin={item}
				onSelect={handleSelectVendor}
			/>
		),
		[handleSelectVendor],
	);

	// Footer component for loading indicator
	const renderFooter = () => {
		if (!isFetchingNextPage) return null;
		return (
			<View className="py-4 items-center">
				<ActivityIndicator
					size="small"
					color={colors.primary}
				/>
			</View>
		);
	};

	// Empty component
	const renderEmpty = () => {
		if (isLoading) {
			return (
				<View className="mt-2">
					{[...Array(5)].map((_, index) => (
						<VendorCardSkeleton key={index} />
					))}
				</View>
			);
		}
		return (
			<View className="card-3d rounded-2xl p-8 items-center justify-center mt-4 mx-4">
				<View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
					<StacksIcon
						size={32}
						color={colors.mutedForeground}
					/>
				</View>
				<TextComponent className="text-foreground text-center text-lg font-semibold mb-2">
					No vendors found
				</TextComponent>
				<TextComponent className="text-muted-foreground text-center">
					{debouncedQuery
						? 'Try adjusting your search query'
						: 'No vendors are currently available'}
				</TextComponent>
			</View>
		);
	};

	return (
		<View className="flex-1 bg-background">
			{/* Gradient Header */}
			<LinearGradient
				colors={[colors.primary, colors.accent]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				className="pt-14 pb-10 px-6 rounded-b-3xl">
				<View className="items-center">
					<View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4">
						<StacksIcon
							size={32}
							color="#fff"
						/>
					</View>
					<TextComponent className="text-white font-bold text-2xl mb-1">
						Find Vendors
					</TextComponent>
					<TextComponent className="text-white/80 text-base text-center">
						Browse and select a vendor for your documents
					</TextComponent>
				</View>
			</LinearGradient>

			{/* Search Bar */}
			<View className="px-5 -mt-5 mb-4">
				<View className="bg-card border border-border rounded-xl flex-row items-center px-4 shadow-sm">
					<SearchIcon
						size={18}
						color={colors.mutedForeground}
					/>
					<TextInput
						className="flex-1 py-3.5 ml-3 text-foreground text-base"
						placeholder="Search vendors by name or location"
						placeholderTextColor={colors.mutedForeground}
						value={searchQuery}
						onChangeText={handleSearchChange}
					/>
				</View>
			</View>

			{/* Vendors List */}
			{isError ? (
				<View className="flex-1 px-5 pt-4">
					<View className="card-3d rounded-2xl p-8 items-center justify-center">
						<TextComponent className="text-destructive text-center text-lg font-semibold mb-2">
							Something went wrong
						</TextComponent>
						<TextComponent className="text-muted-foreground text-center mb-4">
							Failed to load vendors. Please try again.
						</TextComponent>
						<View
							className="bg-primary px-6 py-3 rounded-xl"
							onTouchEnd={() => refetch()}>
							<TextComponent className="text-white font-semibold">
								Retry
							</TextComponent>
						</View>
					</View>
				</View>
			) : (
				<FlatList
					data={admins}
					renderItem={renderVendor}
					keyExtractor={(item) => item._id}
					contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
					showsVerticalScrollIndicator={false}
					onEndReached={handleEndReached}
					onEndReachedThreshold={0.3}
					ListFooterComponent={renderFooter}
					ListEmptyComponent={renderEmpty}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching && !isFetchingNextPage}
							onRefresh={refetch}
							tintColor={colors.primary}
							colors={[colors.primary]}
						/>
					}
				/>
			)}
		</View>
	);
}
