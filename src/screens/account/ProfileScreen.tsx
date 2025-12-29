import React from 'react';
import { View, Text, Pressable, ScrollView, Switch, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../../types/navigation.types';
import { useColorScheme } from 'nativewind';
import { useUserStore } from '../../shared/user-store/useUserStore';

type Props = NativeStackScreenProps<AccountStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const [notifications, setNotifications] = React.useState(true);

  const isVendor = user?.isAdmin || false;

  const handleToggleNotifications = () => {
    setNotifications(!notifications);
    // TODO: Update API with new notification setting
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            // Navigation will be handled automatically by RootNavigator
          },
        },
      ]
    );
  };

  const handleOpenLink = (url: string) => {
    // TODO: Open external link for Privacy Policy / Terms of Service
    Alert.alert('Info', `Opening: ${url}`);
  };

  if (!user) {
    return null; // Should never happen if authenticated
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6">
        {/* Profile Header */}
        <View className="card-3d rounded-xl p-6 items-center mb-6">
          <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-3">
            <Text className="text-3xl text-primary-foreground font-bold">
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-foreground font-bold text-xl mb-1">{user.name}</Text>
          <Text className="text-muted-foreground mb-3">{user.email}</Text>
          
          <View className="bg-primary/20 px-4 py-1 rounded-full">
            <Text className="text-primary font-semibold capitalize">
              {isVendor ? '✓ Vendor Account' : 'User Account'}
            </Text>
          </View>
        </View>

        {/* Vendor-Only Options */}
        {isVendor && (
          <View className="mb-6">
            <Text className="text-foreground font-bold text-lg mb-3">Vendor Options</Text>
            
            <Pressable
              className="card-3d rounded-xl p-4 mb-3 flex-row justify-between items-center active:opacity-80"
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View>
                <Text className="text-foreground font-semibold">Edit Profile</Text>
                <Text className="text-muted-foreground text-sm">Update vendor information</Text>
              </View>
              <Text className="text-primary">→</Text>
            </Pressable>

            <Pressable
              className="card-3d rounded-xl p-4 flex-row justify-between items-center active:opacity-80"
              onPress={() => navigation.navigate('TransactionHistory')}
            >
              <View>
                <Text className="text-foreground font-semibold">Transaction History</Text>
                <Text className="text-muted-foreground text-sm">View token purchases & usage</Text>
              </View>
              <Text className="text-primary">→</Text>
            </Pressable>
          </View>
        )}

        {/* Settings Section */}
        <View className="mb-6">
          <Text className="text-foreground font-bold text-lg mb-3">Settings</Text>

          <View className="card-3d rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-border">
              <View className="flex-1">
                <Text className="text-foreground font-semibold">Push Notifications</Text>
                <Text className="text-muted-foreground text-sm">
                  Receive updates about your documents
                </Text>
              </View>
              <Switch value={notifications} onValueChange={handleToggleNotifications} />
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-foreground font-semibold">Theme</Text>
                <Text className="text-muted-foreground text-sm capitalize">
                  Current: {colorScheme} mode
                </Text>
              </View>
              <Switch value={colorScheme === 'dark'} onValueChange={toggleColorScheme} />
            </View>
          </View>
        </View>

        {/* Legal Section */}
        <View className="mb-6">
          <Text className="text-foreground font-bold text-lg mb-3">Legal</Text>

          <Pressable
            className="card-3d rounded-xl p-4 mb-3 flex-row justify-between items-center active:opacity-80"
            onPress={() => handleOpenLink('https://uploaddoc.app/privacy')}
          >
            <Text className="text-foreground font-semibold">Privacy Policy</Text>
            <Text className="text-primary">→</Text>
          </Pressable>

          <Pressable
            className="card-3d rounded-xl p-4 flex-row justify-between items-center active:opacity-80"
            onPress={() => handleOpenLink('https://uploaddoc.app/terms')}
          >
            <Text className="text-foreground font-semibold">Terms of Service</Text>
            <Text className="text-primary">→</Text>
          </Pressable>
        </View>

        {/* Logout Button */}
        <Pressable
          className="bg-destructive p-4 rounded-lg items-center active:opacity-80 mb-8"
          onPress={handleLogout}
        >
          <Text className="text-destructive-foreground font-bold text-lg">Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
