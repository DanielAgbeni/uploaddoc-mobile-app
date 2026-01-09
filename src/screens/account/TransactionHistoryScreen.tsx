import React, { useMemo } from 'react';
import {
	View,
	FlatList,
	RefreshControl,
	ActivityIndicator,
	TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../../types/navigation.types';
import { getTransactionHistory, PACKAGES } from '../../api/payment';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { TextComponent } from 'src/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';

type Props = NativeStackScreenProps<
	AccountStackParamList,
	'TransactionHistory'
>;

export default function TransactionHistoryScreen({ navigation }: Props) {
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

	const handleLoadMore = () => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	};

	const getPackageName = (packageId: number): string => {
		return PACKAGES[packageId]?.name || 'Unknown';
	};

	const renderTransaction = ({ item }: { item: Transaction }) => {
		const isCompleted = item.status === 'completed';
		const isFailed = item.status === 'failed';

		return (
			<View className="bg-card rounded-2xl p-4 mb-3 shadow-sm border border-border">
				<View className="flex-row justify-between items-start mb-3">
					<View className="flex-1">
						<TextComponent className="text-foreground font-bold text-lg mb-1">
							{getPackageName(item.packageId)} Package
						</TextComponent>
						<TextComponent className="text-muted-foreground text-xs font-medium">
							{new Date(item.createdAt).toLocaleDateString('en-NG', {
								year: 'numeric',
								month: 'short',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
							})}
						</TextComponent>
					</View>

					<View
						className={clsx(
							'px-2.5 py-1 rounded-full',
							isCompleted
								? 'bg-green-500/10'
								: isFailed
									? 'bg-red-500/10'
									: 'bg-yellow-500/10',
						)}>
						<TextComponent
							className={clsx(
								'text-[10px] font-bold uppercase tracking-wider',
								isCompleted
									? 'text-green-600'
									: isFailed
										? 'text-red-600'
										: 'text-yellow-600',
							)}>
							{item.status}
						</TextComponent>
					</View>
				</View>

				<View className="flex-row justify-between items-end pt-2 border-t border-border">
					<View>
						<TextComponent className="text-[10px] uppercase text-muted-foreground font-bold mb-0.5">
							Amount
						</TextComponent>
						<TextComponent className="font-bold text-xl text-foreground">
							₦{item.amount.toLocaleString()}
						</TextComponent>
					</View>
					{isCompleted && (
						<View className="items-end">
							<TextComponent className="text-[10px] uppercase text-muted-foreground font-bold mb-0.5">
								Tokens Received
							</TextComponent>
							<TextComponent className="text-sm text-green-600 font-bold bg-green-500/10 px-2 py-0.5 rounded-lg">
								+{item.tokensAdded}
							</TextComponent>
						</View>
					)}
				</View>
			</View>
		);
	};

	return (
		<View className="flex-1 bg-background">
			<SafeAreaView
				edges={['top']}
				className="flex-1">
				<View className="px-6 py-4 bg-background z-10">
					<View className="flex-row items-center justify-between">
						<TouchableOpacity
							onPress={() => navigation.goBack()}
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
						<View className="flex-1 justify-center items-center">
							<ActivityIndicator
								size="large"
								color={colors.primary}
							/>
						</View>
					) : (
						<FlatList
							data={transactions}
							renderItem={renderTransaction}
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
							ListFooterComponent={
								isFetchingNextPage ? (
									<View className="py-4">
										<ActivityIndicator
											size="small"
											color={colors.primary}
										/>
									</View>
								) : null
							}
							ListEmptyComponent={
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
							}
						/>
					)}
				</View>
			</SafeAreaView>
		</View>
	);
}
