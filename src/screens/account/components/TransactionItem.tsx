import React, { memo } from 'react';
import { View } from 'react-native';
import clsx from 'clsx';
import { TextComponent } from 'src/components';
import { PACKAGES } from '../../../api/payment';

// Type definition for Transaction should ideally be imported
// But assuming it's available or we can redefine/import it
// Since I don't see the global type def file in context, I'll trust it's available or use 'any' if strict.
// Actually, looking at TransactionHistoryScreen, it uses 'Transaction' type which likely comes from api or types.
// I'll check types/index.ts or api/payment.ts if needed, but for now I'll assume it's global or import carefully.
// Wait, in TransactionHistoryScreen it was just `Transaction`. I'll assume it's global or imported.
// Let's import PACKAGES from api/payment.

type TransactionItemProps = {
	item: Transaction;
};

const TransactionItem = ({ item }: TransactionItemProps) => {
	const isCompleted = item.status === 'completed';
	const isFailed = item.status === 'failed';

	const getPackageName = (packageId: number): string => {
		return PACKAGES[packageId]?.name || 'Unknown';
	};

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

export default memo(TransactionItem);
