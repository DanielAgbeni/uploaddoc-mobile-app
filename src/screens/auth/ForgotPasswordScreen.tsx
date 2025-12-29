import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleResetPassword = async () => {
    // TODO: Implement password reset logic with API
    setLoading(true);
    try {
      // Add your password reset API call here
      console.log('Reset password for:', email);
      setSent(true);
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 p-6 justify-center min-h-screen">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Forgot Password</Text>
          <Text className="text-muted-foreground">
            {sent
              ? 'Check your email for password reset instructions'
              : 'Enter your email to receive reset instructions'}
          </Text>
        </View>

        {!sent ? (
          <>
            {/* Form */}
            <View className="card-3d rounded-xl p-6 mb-6">
              <View className="mb-6">
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

              <Pressable
                className="btn-3d bg-primary p-4 rounded-lg items-center active:opacity-80"
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text className="text-primary-foreground font-bold text-lg">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View className="card-3d rounded-xl p-6 mb-6 items-center">
            <View className="w-16 h-16 bg-primary/20 rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">✓</Text>
            </View>
            <Text className="text-foreground font-semibold text-lg mb-2">Email Sent!</Text>
            <Text className="text-muted-foreground text-center mb-6">
              We've sent password reset instructions to {email}
            </Text>
            <Pressable
              className="bg-secondary px-6 py-3 rounded-lg"
              onPress={() => navigation.navigate('SignIn')}
            >
              <Text className="text-secondary-foreground font-semibold">Back to Sign In</Text>
            </Pressable>
          </View>
        )}

        {/* Footer */}
        <View className="flex-row justify-center items-center">
          <Text className="text-muted-foreground">Remember your password? </Text>
          <Pressable onPress={() => navigation.navigate('SignIn')}>
            <Text className="text-primary font-semibold">Sign In</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
