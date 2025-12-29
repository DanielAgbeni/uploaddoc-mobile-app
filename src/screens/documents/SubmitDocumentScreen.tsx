import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-image-picker';
import { DocumentsStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'SubmitDocument'>;

export default function SubmitDocumentScreen({ navigation, route }: Props) {
  const { vendorId, vendorName, isVendorLocked } = route.params || {};

  const [selectedVendor, setSelectedVendor] = React.useState(vendorName || '');
  const [selectedFile, setSelectedFile] = React.useState<any>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSelectFile = async () => {
    try {
      // Request permission and pick file
      const result = await DocumentPicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedVendor) {
      Alert.alert('Error', 'Please select a vendor');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a document title');
      return;
    }

    // TODO: Implement document submission logic with API
    setLoading(true);
    try {
      console.log('Submitting document:', {
        vendorId,
        vendor: selectedVendor,
        file: selectedFile,
        title,
        description,
      });

      // After successful submission
      Alert.alert('Success', 'Document submitted successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Submit Document</Text>
          <Text className="text-muted-foreground">
            Upload and submit your document to a vendor
          </Text>
        </View>

        {/* Form */}
        <View className="card-3d rounded-xl p-6 mb-6">
          {/* Vendor Selection */}
          <View className="mb-4">
            <Text className="text-foreground font-semibold mb-2">
              Vendor {isVendorLocked && '(Pre-selected)'}
            </Text>
            <TextInput
              className={`bg-input border border-border rounded-lg p-3 text-foreground ${
                isVendorLocked ? 'opacity-50' : ''
              }`}
              placeholder="Search or select vendor..."
              placeholderTextColor="#888"
              value={selectedVendor}
              onChangeText={setSelectedVendor}
              editable={!isVendorLocked}
            />
            {!isVendorLocked && (
              <Text className="text-muted-foreground text-xs mt-1">
                TODO: Add autocomplete vendor search
              </Text>
            )}
          </View>

          {/* File Upload */}
          <View className="mb-4">
            <Text className="text-foreground font-semibold mb-2">File</Text>
            {selectedFile ? (
              <View className="bg-secondary border border-border rounded-lg p-4">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-secondary-foreground font-semibold" numberOfLines={1}>
                      {selectedFile.fileName || 'Selected file'}
                    </Text>
                    <Text className="text-muted-foreground text-xs">
                      {selectedFile.fileSize
                        ? `${(selectedFile.fileSize / 1024 / 1024).toFixed(2)} MB`
                        : 'Size unknown'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setSelectedFile(null)}
                    className="ml-3 bg-destructive px-3 py-2 rounded-lg"
                  >
                    <Text className="text-destructive-foreground font-semibold">Remove</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                className="border-2 border-dashed border-border rounded-lg p-6 items-center active:opacity-80"
                onPress={handleSelectFile}
              >
                <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mb-3">
                  <Text className="text-primary text-2xl">📄</Text>
                </View>
                <Text className="text-foreground font-semibold mb-1">Select File</Text>
                <Text className="text-muted-foreground text-xs text-center">
                  Tap to browse and select a file
                </Text>
              </Pressable>
            )}
          </View>

          {/* Document Title */}
          <View className="mb-4">
            <Text className="text-foreground font-semibold mb-2">
              Document Title <Text className="text-destructive">*</Text>
            </Text>
            <TextInput
              className="bg-input border border-border rounded-lg p-3 text-foreground"
              placeholder="e.g., Invoice #1234"
              placeholderTextColor="#888"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description (Optional) */}
          <View className="mb-6">
            <Text className="text-foreground font-semibold mb-2">
              Description <Text className="text-muted-foreground text-sm">(Optional)</Text>
            </Text>
            <TextInput
              className="bg-input border border-border rounded-lg p-3 text-foreground"
              placeholder="Add any additional notes..."
              placeholderTextColor="#888"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <Pressable
            className="btn-3d bg-primary p-4 rounded-lg items-center active:opacity-80"
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text className="text-primary-foreground font-bold text-lg">
              {loading ? 'Submitting...' : 'Submit Document'}
            </Text>
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            className="mt-3 p-3 items-center"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-muted-foreground font-semibold">Cancel</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
