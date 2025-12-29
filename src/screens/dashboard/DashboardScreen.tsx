import React from 'react';
import { View, Text, Pressable, ScrollView, FlatList, Switch, Alert } from 'react-native';

// Mock vendor data - replace with actual user state/API
const mockVendorData = {
  isVendor: true,
  tokensAvailable: 150,
  documentsReceived: 42,
  autoSyncEnabled: true,
  googleDriveConnected: true,
  shareableLink: 'https://uploaddoc.app/v/vendor123',
};

// Mock pending documents
const mockPendingDocuments = [
  {
    id: '1',
    title: 'Invoice #5678',
    submittedBy: 'John Doe',
    submittedAt: '2025-12-29T14:30:00Z',
    fileUrl: 'https://example.com/document.pdf',
  },
  {
    id: '2',
    title: 'Receipt - Equipment Purchase',
    submittedBy: 'Jane Smith',
    submittedAt: '2025-12-29T13:15:00Z',
    fileUrl: 'https://example.com/receipt.pdf',
  },
];

export default function DashboardScreen() {
  const [autoSync, setAutoSync] = React.useState(mockVendorData.autoSyncEnabled);
  const [pendingDocs, setPendingDocs] = React.useState(mockPendingDocuments);

  const handleCopyLink = () => {
    // TODO: Implement copy to clipboard
    Alert.alert('Link Copied', 'Shareable link copied to clipboard');
  };

  const handleAcceptDocument = (docId: string) => {
    Alert.alert(
      'Accept Document',
      'Do you want to accept this document?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: () => {
            // TODO: Implement accept logic with API
            setPendingDocs(pendingDocs.filter((doc) => doc.id !== docId));
            Alert.alert('Success', 'Document accepted and synced to Drive');
          },
        },
      ]
    );
  };

  const handleRejectDocument = (docId: string) => {
    Alert.alert(
      'Reject Document',
      'Are you sure you want to reject this document?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement reject logic with API
            setPendingDocs(pendingDocs.filter((doc) => doc.id !== docId));
            Alert.alert('Document Rejected', 'The document has been removed');
          },
        },
      ]
    );
  };

  const handleToggleAutoSync = () => {
    setAutoSync(!autoSync);
    // TODO: Update API with new sync setting
  };

  const renderDocument = ({ item }: { item: typeof mockPendingDocuments[0] }) => (
    <View className="card-3d rounded-xl p-4 mb-3">
      <Text className="text-foreground font-semibold text-lg mb-1">{item.title}</Text>
      <Text className="text-muted-foreground text-sm mb-1">From: {item.submittedBy}</Text>
      <Text className="text-muted-foreground text-xs mb-3">
        {new Date(item.submittedAt).toLocaleString()}
      </Text>

      <View className="flex-row gap-2">
        <Pressable
          className="flex-1 bg-green-600 p-3 rounded-lg items-center active:opacity-80"
          onPress={() => handleAcceptDocument(item.id)}
        >
          <Text className="text-white font-semibold">Accept</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-destructive p-3 rounded-lg items-center active:opacity-80"
          onPress={() => handleRejectDocument(item.id)}
        >
          <Text className="text-destructive-foreground font-semibold">Reject</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Vendor Dashboard</Text>
          <Text className="text-muted-foreground">Manage your vendor account</Text>
        </View>

        {/* Stats Card */}
        <View className="card-3d rounded-xl p-6 mb-6">
          <Text className="text-foreground font-bold text-lg mb-4">Account Stats</Text>

          <View className="flex-row mb-4">
            <View className="flex-1 bg-primary/10 rounded-lg p-4">
              <Text className="text-muted-foreground text-sm mb-1">Available Tokens</Text>
              <Text className="text-primary font-bold text-2xl">{mockVendorData.tokensAvailable}</Text>
            </View>
            <View className="w-3" />
            <View className="flex-1 bg-secondary/10 rounded-lg p-4">
              <Text className="text-muted-foreground text-sm mb-1">Documents Received</Text>
              <Text className="text-secondary-foreground font-bold text-2xl">
                {mockVendorData.documentsReceived}
              </Text>
            </View>
          </View>

          {/* Auto-sync Toggle */}
          <View className="flex-row justify-between items-center p-4 bg-muted rounded-lg mb-3">
            <View className="flex-1">
              <Text className="text-foreground font-semibold">Auto-sync to Google Drive</Text>
              <Text className="text-muted-foreground text-xs mt-1">
                Automatically sync accepted documents
              </Text>
            </View>
            <Switch value={autoSync} onValueChange={handleToggleAutoSync} />
          </View>

          {/* Google Drive Status */}
          <View className="flex-row items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <View className="w-2 h-2 bg-green-600 rounded-full mr-2" />
            <Text className="text-green-700 dark:text-green-400 font-semibold">
              Google Drive Connected
            </Text>
          </View>
        </View>

        {/* Shareable Link */}
        <View className="card-3d rounded-xl p-6 mb-6">
          <Text className="text-foreground font-bold text-lg mb-3">Shareable Link</Text>
          <Text className="text-muted-foreground text-sm mb-3">
            Share this link with users to receive documents directly
          </Text>

          <View className="bg-secondary/20 p-3 rounded-lg mb-3">
            <Text className="text-foreground font-mono text-sm" numberOfLines={1}>
              {mockVendorData.shareableLink}
            </Text>
          </View>

          <Pressable
            className="bg-primary p-3 rounded-lg items-center active:opacity-80"
            onPress={handleCopyLink}
          >
            <Text className="text-primary-foreground font-semibold">Copy Link</Text>
          </Pressable>
        </View>

        {/* Document Queue */}
        <View className="mb-6">
          <Text className="text-foreground font-bold text-xl mb-4">
            Pending Documents ({pendingDocs.length})
          </Text>

          {pendingDocs.length > 0 ? (
            <FlatList
              data={pendingDocs}
              renderItem={renderDocument}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View className="card-3d rounded-xl p-8 items-center">
              <Text className="text-muted-foreground text-center">
                No pending documents at the moment
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
