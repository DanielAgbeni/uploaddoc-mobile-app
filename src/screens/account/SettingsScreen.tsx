import React from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../../types/navigation.types';
import { useColorScheme } from 'nativewind';

type Props = NativeStackScreenProps<AccountStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [notifications, setNotifications] = React.useState(true);

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
          
          <Text className="text-3xl font-bold text-foreground mb-2">Settings</Text>
          <Text className="text-muted-foreground">Manage app preferences</Text>
        </View>

        {/* Settings */}
        <View className="card-3d rounded-xl p-4 mb-6">
          <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-border">
            <View className="flex-1">
              <Text className="text-foreground font-semibold">Push Notifications</Text>
              <Text className="text-muted-foreground text-sm">
                Receive updates about your documents
              </Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} />
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
    </ScrollView>
  );
}
