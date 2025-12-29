import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<AccountStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const [businessName, setBusinessName] = React.useState('Acme Corporation');
  const [description, setDescription] = React.useState('Global supplier of office supplies and equipment');
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement save logic with API
      console.log('Saving profile:', { businessName, description });
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = () => {
    Alert.alert(
      'Generate New Link',
      'This will invalidate your old shareable link. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Generate',
          onPress: () => {
            // TODO: Implement link generation
            Alert.alert('Success', 'New link generated successfully');
          },
        },
      ]
    );
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
          
          <Text className="text-3xl font-bold text-foreground mb-2">Edit Profile</Text>
          <Text className="text-muted-foreground">Update your vendor information</Text>
        </View>

        {/* Form */}
        <View className="card-3d rounded-xl p-6 mb-6">
          {/* Profile Image */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-3">
              <Text className="text-4xl text-primary-foreground">📸</Text>
            </View>
            <Pressable className="bg-secondary px-4 py-2 rounded-lg">
              <Text className="text-secondary-foreground font-semibold">Change Photo</Text>
            </Pressable>
          </View>

          {/* Business Name */}
          <View className="mb-4">
            <Text className="text-foreground font-semibold mb-2">Business Name</Text>
            <TextInput
              className="bg-input border border-border rounded-lg p-3 text-foreground"
              placeholder="Your business name"
              placeholderTextColor="#888"
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-foreground font-semibold mb-2">Description</Text>
            <TextInput
              className="bg-input border border-border rounded-lg p-3 text-foreground"
              placeholder="Brief description of your business"
              placeholderTextColor="#888"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Save Button */}
          <Pressable
            className="btn-3d bg-primary p-4 rounded-lg items-center active:opacity-80"
            onPress={handleSave}
            disabled={loading}
          >
            <Text className="text-primary-foreground font-bold text-lg">
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>

        {/* Shareable Link Management */}
        <View className="card-3d rounded-xl p-6 mb-6">
          <Text className="text-foreground font-bold text-lg mb-3">Shareable Link</Text>
          
          <View className="bg-secondary/20 p-3 rounded-lg mb-3">
            <Text className="text-foreground font-mono text-sm">
              https://uploaddoc.app/v/vendor123
            </Text>
          </View>

          <Pressable
            className="bg-destructive p-3 rounded-lg items-center active:opacity-80"
            onPress={handleGenerateLink}
          >
            <Text className="text-destructive-foreground font-semibold">
              Generate New Link
            </Text>
          </Pressable>
          
          <Text className="text-muted-foreground text-xs mt-2 text-center">
            Warning: This will invalidate your current link
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
