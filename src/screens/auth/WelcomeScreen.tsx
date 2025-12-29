import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import { Image } from 'expo-image';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-background justify-center items-center p-6">
      {/* Logo/Brand Section */}
      <View className="items-center mb-12">
        <Image source={require('../../assets/app-images/icon.png')} className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4" />
        <Text className="text-3xl font-bold text-foreground mb-2">UploadDoc</Text>
        <Text className="text-muted-foreground text-center">
          Simplify document submission and management
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="w-full max-w-sm gap-4">
        <Pressable
          className="btn-3d bg-primary p-4 rounded-lg items-center active:opacity-80"
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text className="text-primary-foreground font-bold text-lg">Sign In</Text>
        </Pressable>

        <Pressable
          className="card-3d bg-secondary p-4 rounded-lg items-center active:opacity-80"
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text className="text-secondary-foreground font-bold text-lg">Sign Up</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View className="absolute bottom-8">
        <Text className="text-muted-foreground text-sm">
          Secure • Fast • Reliable
        </Text>
      </View>
    </View>
  );
}
