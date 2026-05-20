import React, { useCallback, useMemo } from 'react';
import {
	View,
	RefreshControl,
	ActivityIndicator,
	TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../../types/navigation.types';
import { getTransactionHistory } from '../../api/payment';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { TextComponent } from 'src/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import { FlashList } from '@shopify/flash-list';
import TransactionItem from './components/TransactionItem';
import TransactionItemSkeleton from './components/TransactionItemSkeleton';

type Props = NativeStackScreenProps<
	AccountStackParamList,
	'TransactionHistory'
>;

function TransactionHistoryScreen({ navigation }: Props) {
	const { colors } = useTheme();

	const {
		data,
		isLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
	} = useInfiniteQuery({
		queryKey: ['transactionHistory'],
		queryFn: ({ pageParam = 1 }) => getTransactionHistory(pageParam, 10),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { currentPage, totalPages } = lastPage.data.data.pagination;
			return currentPage < totalPages ? currentPage + 1 : undefined;
		},
	});

	useRefreshOnFocus(refetch);

	const transactions = useMemo(() => {
		return data?.pages.flatMap((page) => page.data.data.transactions) || [];
	}, [data]);

	const handleGoBack = useCallback(() => {
		navigation.goBack();
	}, [navigation]);

	const handleLoadMore = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const renderTransaction = useCallback(({ item }: { item: Transaction }) => (
		<TransactionItem item={item} />
	), []);

	const renderFooter = useCallback(() => {
		if (!isFetchingNextPage) return null;
		return (
			<View className="py-4">
				<ActivityIndicator
					size="small"
					color={colors.primary}
				/>
			</View>
		);
	}, [isFetchingNextPage, colors.primary]);

	const renderEmpty = useCallback(() => {
		return (
			<View className="bg-card rounded-2xl p-8 items-center justify-center border border-border/50 mt-4">
				<View className="bg-muted/30 p-4 rounded-full mb-4">
					<TextComponent className="text-3xl">💸</TextComponent>
				</View>
				<TextComponent className="text-foreground font-bold text-lg mb-1">
					No Transactions Yet
				</TextComponent>
				<TextComponent className="text-muted-foreground text-center text-sm">
					Your purchase history will appear here once you buy tokens.
				</TextComponent>
			</View>
		);
	}, []);

	return (
		<View className="flex-1 bg-background">
			<SafeAreaView
				edges={['top']}
				className="flex-1">
				<View className="px-6 py-4 bg-background z-10">
					<View className="flex-row items-center justify-between">
						<TouchableOpacity
							onPress={handleGoBack}
							className="p-2 -ml-2 rounded-full active:bg-muted/50">
							<ChevronLeft
								size={24}
								color={colors.foreground}
							/>
						</TouchableOpacity>
						<TextComponent className="text-lg font-bold text-foreground">
							Transaction History
						</TextComponent>
						<View className="w-10" />
					</View>
				</View>

				<View className="flex-1 px-4">
					{isLoading ? (
						<View className="flex-1 pt-2">
							{[...Array(6)].map((_, index) => (
								<TransactionItemSkeleton key={index} />
							))}
						</View>
					) : (
						<FlashList
							data={transactions}
							renderItem={renderTransaction}
							estimatedItemSize={80}
							keyExtractor={(item) => item._id}
							contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
							showsVerticalScrollIndicator={false}
							refreshControl={
								<RefreshControl
									refreshing={isRefetching && !isLoading}
									onRefresh={refetch}
									colors={[colors.primary]}
								/>
							}
							onEndReached={handleLoadMore}
							onEndReachedThreshold={0.5}
							ListFooterComponent={renderFooter}
							ListEmptyComponent={renderEmpty}
						/>
					)}
				</View>
			</SafeAreaView>
		</View>
	);
}

export default React.memo(TransactionHistoryScreen);
