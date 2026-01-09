import React, { useEffect, useState } from 'react';
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

type Props = NativeStackScreenProps<
	AccountStackParamList,
	'TransactionHistory'
>;

export default function TransactionHistoryScreen({ navigation }: Props) {
	const { colors } = useTheme();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalCount: 0,
		limit: 10,
	});

	const fetchTransactions = async (
		page: number = 1,
		refresh: boolean = false,
	) => {
		if (!refresh && page > pagination.totalPages && page !== 1) return;

		if (refresh) {
			setRefreshing(true);
		} else if (page > 1) {
			setLoadingMore(true);
		} else {
			setLoading(true);
		}

		try {
			const response = await getTransactionHistory(page, pagination.limit);
			if (response.data.success) {
				const newTransactions = response.data.data.transactions;
				if (refresh || page === 1) {
					setTransactions(newTransactions);
				} else {
					setTransactions((prev) => [...prev, ...newTransactions]);
				}
				setPagination(response.data.data.pagination);
			}
		} catch (error) {
			console.error('Failed to fetch transactions:', error);
		} finally {
			setLoading(false);
			setRefreshing(false);
			setLoadingMore(false);
		}
	};

	useEffect(() => {
		fetchTransactions(1);
	}, []);

	const handleRefresh = () => {
		fetchTransactions(1, true);
	};

	const handleLoadMore = () => {
		if (!loadingMore && pagination.currentPage < pagination.totalPages) {
			fetchTransactions(pagination.currentPage + 1);
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
					{loading ? (
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
									refreshing={refreshing}
									onRefresh={handleRefresh}
									colors={[colors.primary]}
								/>
							}
							onEndReached={handleLoadMore}
							onEndReachedThreshold={0.5}
							ListFooterComponent={
								loadingMore ? (
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
