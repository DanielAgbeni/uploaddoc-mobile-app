import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSignUp = async () => {
    // TODO: Implement sign up logic with API
    setLoading(true);
    try {
      // Add your sign up API call here
      console.log('Sign up:', { name, email, password });
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 p-6 justify-center min-h-screen">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Create Account</Text>
          <Text className="text-muted-foreground">Sign up to get started</Text>
        </View>

        {/* Form */}
        <View className="card-3d rounded-xl p-6 mb-6">
          <View className="mb-4">
            <Text className="text-foreground font-semibold mb-2">Full Name</Text>
            <TextInput
              className="bg-input border border-border rounded-lg p-3 text-foreground"
              placeholder="John Doe"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
          </View>

          <View className="mb-4">
            <Text className="text-foreground font-semibold mb-2">Email</Text>
            <TextInput
              className="bg-input border border-border rounded-lg p-3 text-foreground"
              placeholder="your@email.com"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View className="mb-4">
            <Text className="text-foreground font-semibold mb-2">Password</Text>
            <TextInput
              className="bg-input border border-border rounded-lg p-3 text-foreground"
              placeholder="••••••••"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          <View className="mb-6">
            <Text className="text-foreground font-semibold mb-2">Confirm Password</Text>
            <TextInput
              className="bg-input border border-border rounded-lg p-3 text-foreground"
              placeholder="••••••••"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          <Pressable
            className="btn-3d bg-primary p-4 rounded-lg items-center active:opacity-80"
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text className="text-primary-foreground font-bold text-lg">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center items-center">
          <Text className="text-muted-foreground">Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate('SignIn')}>
            <Text className="text-primary font-semibold">Sign In</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
