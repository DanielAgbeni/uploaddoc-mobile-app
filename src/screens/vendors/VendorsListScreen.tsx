import React, { useState, useCallback } from 'react';
import {
	View,
	TextInput,
	ActivityIndicator,
	RefreshControl,
	Pressable,
	StatusBar,
	useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';

import {
	VendorsStackParamList,
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
	const { width } = useWindowDimensions();
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const numColumns = width >= 1000 ? 3 : width >= 680 ? 2 : 1;

	// Debounce search
	const debouncedSearch = useDebouncedCallback((query: string) => {
		setDebouncedQuery(query);
	}, 500);

	const handleSearchChange = useCallback((query: string) => {
		setSearchQuery(query);
		debouncedSearch(query);
	}, [debouncedSearch]);

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

	// Handle vendor selection (goes to VendorDetails page)
	const handleSelectVendor = useCallback(
		(admin: Admin) => {
			navigation.navigate('VendorDetails', {
				vendorId: admin._id,
			});
		},
		[navigation],
	);

	// Handle end reached for infinite scroll
	const handleEndReached = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
	const renderFooter = useCallback(() => {
		if (!isFetchingNextPage) return null;
		return (
			<View className="py-4 items-center">
				<ActivityIndicator
					size="small"
					color={colors.primary}
				/>
			</View>
		);
	}, [isFetchingNextPage, colors.primary]);

	// Empty component
	const renderEmpty = useCallback(() => {
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
	}, [isLoading, colors.mutedForeground, colors.muted, debouncedQuery]);

	return (
		<View className="flex-1 bg-background">
			<StatusBar
				barStyle="light-content"
				backgroundColor="transparent"
				translucent
			/>

			{/* Gradient Header */}
			<LinearGradient
				colors={[colors.gradientStart, colors.gradientEnd]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				className="rounded-b-[32px] px-6 pb-12 pt-14">
				<View className="items-center">
					<View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
						<StacksIcon
							size={32}
							color="#fff"
						/>
					</View>
					<TextComponent className="mb-1 text-2xl font-bold text-white">
						Find Vendor
					</TextComponent>
					<TextComponent className="text-center text-base text-white/80">
						Choose a verified provider for your document upload
					</TextComponent>
				</View>
			</LinearGradient>

			{/* Search Bar */}
			<View className="-mt-6 mb-4 px-5">
				<View className="flex-row items-center rounded-2xl border border-border bg-card px-4 shadow-sm">
					<SearchIcon
						size={18}
						color={colors.mutedForeground}
					/>
					<TextInput
						className="ml-3 flex-1 py-4 text-base text-foreground"
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
						<Pressable
							className="rounded-xl bg-primary px-6 py-3 active:opacity-85"
							onPress={() => refetch()}>
							<TextComponent className="text-white font-semibold">
								Retry
							</TextComponent>
						</Pressable>
					</View>
				</View>
			) : (
				<View className="flex-1">
					<FlashList
						key={`vendors-${numColumns}`}
						data={admins}
						renderItem={renderVendor}
						keyExtractor={(item) => item._id}
						numColumns={numColumns}
						estimatedItemSize={140}
						contentContainerStyle={{
							paddingHorizontal: 20,
							paddingBottom: 24,
							paddingTop: 4,
						}}
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
				</View>
			)}
		</View>
	);
}
