import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DocumentsStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'DocumentsList'>;

// Mock data - replace with actual API data
const mockDocuments = [
  {
    id: '1',
    title: 'Invoice #1234',
    vendorName: 'Acme Corp',
    status: 'pending',
    timestamp: '2025-12-29T10:30:00Z',
  },
  {
    id: '2',
    title: 'Receipt - Office Supplies',
    vendorName: 'Office Depot',
    status: 'accepted',
    timestamp: '2025-12-28T14:20:00Z',
  },
  {
    id: '3',
    title: 'Purchase Order #5678',
    vendorName: 'Tech Supplies Inc',
    status: 'rejected',
    timestamp: '2025-12-27T09:15:00Z',
  },
];

export default function DocumentsListScreen({ navigation }: Props) {
  const renderDocument = ({ item }: { item: typeof mockDocuments[0] }) => {
    const statusColors = {
      pending: 'bg-yellow-500/20 border-yellow-500',
      accepted: 'bg-green-500/20 border-green-500',
      rejected: 'bg-red-500/20 border-red-500',
    };

    const statusTextColors = {
      pending: 'text-yellow-600',
      accepted: 'text-green-600',
      rejected: 'text-red-600',
    };

    return (
      <Pressable className="card-3d rounded-xl p-4 mb-3 active:opacity-80">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-foreground font-semibold text-lg flex-1" numberOfLines={1}>
            {item.title}
          </Text>
          <View className={`px-3 py-1 rounded-full border ${statusColors[item.status as keyof typeof statusColors]}`}>
            <Text className={`text-xs font-semibold capitalize ${statusTextColors[item.status as keyof typeof statusTextColors]}`}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <Text className="text-muted-foreground mb-1">
          Vendor: {item.vendorName}
        </Text>
        
        <Text className="text-muted-foreground text-xs">
          {new Date(item.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary p-6 pb-8">
        <Text className="text-2xl font-bold text-primary-foreground">Documents</Text>
        <Text className="text-primary-foreground/80 mt-1">Your submitted documents</Text>
      </View>

      {/* Documents List */}
      <View className="flex-1 px-4 -mt-4">
        <FlatList
          data={mockDocuments}
          renderItem={renderDocument}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="card-3d rounded-xl p-8 items-center justify-center mt-4">
              <Text className="text-muted-foreground text-center text-lg mb-2">
                No documents yet
              </Text>
              <Text className="text-muted-foreground text-center">
                Submit your first document to get started
              </Text>
            </View>
          }
        />
      </View>

      {/* Floating Action Button */}
      <Pressable
        className="absolute bottom-6 right-6 btn-3d bg-primary w-16 h-16 rounded-full items-center justify-center shadow-lg active:opacity-80"
        onPress={() => navigation.navigate('SubmitDocument', {})}
      >
        <Text className="text-primary-foreground text-3xl font-bold">+</Text>
      </Pressable>
    </View>
  );
}
