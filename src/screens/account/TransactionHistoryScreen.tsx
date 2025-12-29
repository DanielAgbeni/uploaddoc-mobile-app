import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<AccountStackParamList, 'TransactionHistory'>;

// Mock transaction data - replace with actual API
const mockTransactions = [
  {
    id: '1',
    type: 'purchase',
    amount: 50,
    description: 'Token purchase - 50 tokens',
    date: '2025-12-28T10:30:00Z',
  },
  {
    id: '2',
    type: 'usage',
    amount: -5,
    description: 'Document processing fee',
    date: '2025-12-27T14:20:00Z',
  },
  {
    id: '3',
    type: 'purchase',
    amount: 100,
    description: 'Token purchase - 100 tokens',
    date: '2025-12-26T09:15:00Z',
  },
  {
    id: '4',
    type: 'usage',
    amount: -3,
    description: 'Document processing fee',
    date: '2025-12-25T16:45:00Z',
  },
];

export default function TransactionHistoryScreen({ navigation }: Props) {
  const renderTransaction = ({ item }: { item: typeof mockTransactions[0] }) => {
    const isPurchase = item.type === 'purchase';
    const amountColor = isPurchase ? 'text-green-600' : 'text-red-600';
    const amountPrefix = isPurchase ? '+' : '';

    return (
      <View className="card-3d rounded-xl p-4 mb-3">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-foreground font-semibold text-lg mb-1">
              {item.description}
            </Text>
            <Text className="text-muted-foreground text-sm">
              {new Date(item.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Text className={`font-bold text-xl ${amountColor}`}>
            {amountPrefix}{item.amount}
          </Text>
        </View>
        
        <View className={`px-3 py-1 rounded-full self-start ${
          isPurchase ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}>
          <Text className={`text-xs font-semibold capitalize ${amountColor}`}>
            {item.type}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Pressable
            className="mb-4 flex-row items-center"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-primary text-lg">← Back</Text>
          </Pressable>
          
          <Text className="text-3xl font-bold text-foreground mb-2">Transaction History</Text>
          <Text className="text-muted-foreground">Token purchases and usage</Text>
        </View>

        {/* Transactions List */}
        <FlatList
          data={mockTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="card-3d rounded-xl p-8 items-center">
              <Text className="text-muted-foreground text-center">
                No transactions yet
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
