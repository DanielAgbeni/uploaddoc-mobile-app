import React from 'react';
import { View, Text, FlatList, Pressable, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VendorsStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<VendorsStackParamList, 'VendorsList'>;

// Mock data - replace with actual API data
const mockVendors = [
  {
    id: '1',
    name: 'Acme Corporation',
    description: 'Global supplier of office supplies and equipment',
    acceptanceRate: 95,
    documentsReceived: 1234,
  },
  {
    id: '2',
    name: 'Tech Supplies Inc',
    description: 'Leading provider of technology and software solutions',
    acceptanceRate: 88,
    documentsReceived: 856,
  },
  {
    id: '3',
    name: 'Office Depot',
    description: 'Comprehensive office and business supplies',
    acceptanceRate: 92,
    documentsReceived: 2105,
  },
];

export default function VendorsListScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredVendors = mockVendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderVendor = ({ item }: { item: typeof mockVendors[0] }) => {
    const rateColor =
      item.acceptanceRate >= 90
        ? 'text-green-600'
        : item.acceptanceRate >= 75
        ? 'text-yellow-600'
        : 'text-red-600';

    return (
      <Pressable
        className="card-3d rounded-xl p-4 mb-3 active:opacity-80"
        onPress={() => navigation.navigate('VendorDetails', { vendorId: item.id })}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-foreground font-bold text-lg mb-1">{item.name}</Text>
            <Text className="text-muted-foreground text-sm" numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-border">
          <View>
            <Text className="text-muted-foreground text-xs mb-1">Acceptance Rate</Text>
            <Text className={`font-bold text-lg ${rateColor}`}>{item.acceptanceRate}%</Text>
          </View>
          <View>
            <Text className="text-muted-foreground text-xs mb-1 text-right">Documents</Text>
            <Text className="text-foreground font-semibold text-right">
              {item.documentsReceived.toLocaleString()}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary p-6 pb-8">
        <Text className="text-2xl font-bold text-primary-foreground">Find Vendors</Text>
        <Text className="text-primary-foreground/80 mt-1">Browse available vendors</Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 -mt-4 mb-4">
        <View className="card-3d rounded-xl p-2">
          <TextInput
            className="bg-input rounded-lg p-3 text-foreground"
            placeholder="Search vendors..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Vendors List */}
      <View className="flex-1 px-4">
        <FlatList
          data={filteredVendors}
          renderItem={renderVendor}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="card-3d rounded-xl p-8 items-center justify-center">
              <Text className="text-muted-foreground text-center text-lg mb-2">
                No vendors found
              </Text>
              <Text className="text-muted-foreground text-center">
                Try adjusting your search
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
