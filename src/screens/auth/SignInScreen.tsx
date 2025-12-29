import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import { useLoginMutation } from '../../hooks/useLoginMutation';
import { showMessage } from 'react-native-flash-message';
import { AxiosError } from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { Image } from 'expo-image';
import { MainContainer } from 'src/shared/components';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

type SignInFormData = {
  email: string;
  password: string;
};

export default function SignInScreen({ navigation }: Props) {
  const loginMutation = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: SignInFormData) => {
    loginMutation.mutate(
      { email: data.email.trim(), password: data.password.trim() },
      {
        onSuccess: (response) => {
          showMessage({
            message: 'Login Successful',
            description: `Welcome back, ${response.data.data.user.name}!`,
            type: 'success',
            duration: 3000,
          });
        },
        onError: (error: AxiosError<ErrorResponseType>) => {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.errors?.email ||
            error.response?.data?.errors?.password ||
            'Failed to sign in. Please try again.';

          showMessage({
            message: 'Login Failed',
            description: errorMessage,
            type: 'danger',
            duration: 4000,
          });
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView 
        className="flex-1"
        contentContainerClassName="flex-grow"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <MainContainer className="flex-1 px-6 pt-16 pb-8">
          {/* Hero Section */}
          <View className="mb-12">
            <Image 
              source={require('../../assets/app-images/icon.png')} 
              className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-6" 
            />
            <Text className="text-4xl font-bold text-foreground mb-3">
              Welcome Back
            </Text>
            <Text className="text-lg text-muted-foreground">
              Sign in to continue to your account
            </Text>
          </View>

          {/* Form Container */}
          <View className="flex-1">
            {/* Email Field */}
            <View className="mb-5">
              <Text className="text-foreground font-semibold mb-2 text-base">
                Email Address
              </Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      className={`bg-input border rounded-xl p-4 text-foreground text-base ${
                        errors.email ? 'border-destructive' : 'border-border focus:border-primary'
                      }`}
                      placeholder="Enter your email"
                      placeholderTextColor="#888"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!loginMutation.isPending}
                    />
                    {errors.email && (
                      <View className="flex-row items-center mt-2">
                        <Text className="text-destructive text-sm">⚠ {errors.email.message}</Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Password Field */}
            <View className="mb-3">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-foreground font-semibold text-base">
                  Password
                </Text>
                <Pressable
                  onPress={() => navigation.navigate('ForgotPassword')}
                  disabled={loginMutation.isPending}
                  className="active:opacity-70"
                >
                  <Text className="text-primary font-medium text-sm">
                    Forgot?
                  </Text>
                </Pressable>
              </View>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      className={`bg-input border rounded-xl p-4 text-foreground text-base ${
                        errors.password ? 'border-destructive' : 'border-border focus:border-primary/50'
                      }`}
                      placeholder="Enter your password"
                      placeholderTextColor="#888"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      autoComplete="password"
                      editable={!loginMutation.isPending}
                    />
                    {errors.password && (
                      <View className="flex-row items-center mt-2">
                        <Text className="text-destructive text-sm">⚠ {errors.password.message}</Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Submit Button */}
            <Pressable
              className={`btn-3d bg-primary rounded-xl p-5 items-center mt-8 ${
                loginMutation.isPending ? 'opacity-50' : 'active:opacity-90'
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <View className="flex-row items-center gap-3">
                  <ActivityIndicator color="#fff" size="small" />
                  <Text className="text-primary-foreground font-bold text-lg">
                    Signing In...
                  </Text>
                </View>
              ) : (
                <Text className="text-primary-foreground font-bold text-lg">
                  Sign In
                </Text>
              )}
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-border" />
              <Text className="px-4 text-muted-foreground text-sm">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Sign Up Section */}
            <View className="items-center">
              <Text className="text-muted-foreground text-base mb-3">
                Don't have an account?
              </Text>
              <Pressable
                onPress={() => navigation.navigate('SignUp')}
                disabled={loginMutation.isPending}
                className="border-2 border-primary rounded-xl px-8 py-4 active:opacity-70"
              >
                <Text className="text-primary font-bold text-base">
                  Create Account
                </Text>
              </Pressable>
            </View>
          </View>
        </MainContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}