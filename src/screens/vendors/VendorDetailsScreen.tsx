import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { VendorsStackParamList, MainTabParamList } from '../../types/navigation.types';

type NavigationProp = CompositeNavigationProp<
  NativeStackScreenProps<VendorsStackParamList, 'VendorDetails'>['navigation'],
  BottomTabNavigationProp<MainTabParamList>
>;

type Props = {
  navigation: NavigationProp;
  route: NativeStackScreenProps<VendorsStackParamList, 'VendorDetails'>['route'];
};

// Mock vendor data - replace with actual API call
const getVendorDetails = (id: string) => ({
  id,
  name: 'Acme Corporation',
  description: 'Global supplier of office supplies and equipment with over 20 years of experience',
  acceptanceRate: 95,
  documentsReceived: 1234,
  averageResponseTime: '2 hours',
  categories: ['Office Supplies', 'Equipment', 'Technology'],
  email: 'contact@acmecorp.com',
  phone: '+1 (555) 123-4567',
});

export default function VendorDetailsScreen({ navigation, route }: Props) {
  const { vendorId } = route.params;
  const vendor = getVendorDetails(vendorId);

  const handleSubmitDocument = () => {
    // Navigate to Documents tab and open SubmitDocument screen with vendor pre-filled
    navigation.navigate('DocumentsTab', {
      screen: 'SubmitDocument',
      params: {
        vendorId: vendor.id,
        vendorName: vendor.name,
        isVendorLocked: true,
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Pressable
            className="mb-4 flex-row items-center"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-primary text-lg">← Back</Text>
          </Pressable>
          
          <Text className="text-3xl font-bold text-foreground mb-2">{vendor.name}</Text>
          <Text className="text-muted-foreground">{vendor.description}</Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 card-3d rounded-xl p-4">
            <Text className="text-muted-foreground text-xs mb-1">Acceptance Rate</Text>
            <Text className="text-green-600 font-bold text-2xl">{vendor.acceptanceRate}%</Text>
          </View>
          <View className="flex-1 card-3d rounded-xl p-4">
            <Text className="text-muted-foreground text-xs mb-1">Documents</Text>
            <Text className="text-foreground font-bold text-2xl">
              {vendor.documentsReceived.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View className="card-3d rounded-xl p-6 mb-6">
          <Text className="text-foreground font-bold text-lg mb-4">Vendor Information</Text>

          <View className="mb-4">
            <Text className="text-muted-foreground text-sm mb-1">Average Response Time</Text>
            <Text className="text-foreground font-semibold">{vendor.averageResponseTime}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-muted-foreground text-sm mb-1">Categories</Text>
            <View className="flex-row flex-wrap gap-2 mt-2">
              {vendor.categories.map((category, index) => (
                <View key={index} className="bg-primary/20 px-3 py-1 rounded-full">
                  <Text className="text-primary text-sm font-medium">{category}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-muted-foreground text-sm mb-1">Email</Text>
            <Text className="text-foreground font-semibold">{vendor.email}</Text>
          </View>

          <View>
            <Text className="text-muted-foreground text-sm mb-1">Phone</Text>
            <Text className="text-foreground font-semibold">{vendor.phone}</Text>
          </View>
        </View>

        {/* Submit Document Button */}
        <Pressable
          className="btn-3d bg-primary p-4 rounded-lg items-center active:opacity-80"
          onPress={handleSubmitDocument}
        >
          <Text className="text-primary-foreground font-bold text-lg">
            Submit Document to {vendor.name}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
