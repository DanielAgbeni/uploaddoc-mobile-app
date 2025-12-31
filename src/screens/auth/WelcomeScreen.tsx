import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import CustomImage from '../../components/common/CustomImage';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../providers/ThemeProvider';
import LoginIcon from 'src/assets/icons/login.icon';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
	const { colorScheme } = useTheme();

	return (
		<View className="flex-1 bg-background">
			{/* Background Gradient Overlay */}
			<LinearGradient
				colors={
					colorScheme === 'dark'
						? ['rgba(68, 78, 187, 0.1)', 'transparent']
						: ['rgba(68, 78, 187, 0.05)', 'transparent']
				}
				className="absolute top-0 left-0 right-0 h-1/2"
			/>

			<View className="flex-1 justify-center items-center p-6">
				{/* Logo/Brand Section */}
				<View className="items-center mb-16">
					<View className="mb-6 items-center">
						<CustomImage
							source={require('../../assets/app-images/icon.png')}
							className="w-40 h-40 rounded-3xl mb-4"
							contentFit="cover"
						/>
					</View>

					<Text className="text-4xl font-bold text-foreground mb-3 text-center">
						UploadDoc
					</Text>
					<Text className="text-muted-foreground text-center text-base px-4 leading-6">
						Simplify document submission and{'\n'}management with ease
					</Text>
				</View>

				{/* Action Buttons */}
				<View className="w-full max-w-sm gap-4">
					{/* Primary Sign In Button with Gradient */}
					<Pressable
						onPress={() => navigation.navigate('SignIn')}
						className="overflow-hidden rounded-xl"
						style={({ pressed }) => ({
							opacity: pressed ? 0.9 : 1,
							transform: [{ scale: pressed ? 0.98 : 1 }],
						})}>
						<LinearGradient
							colors={['#5461e8', '#444ebb']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							className="py-5 px-6 flex-row items-center justify-center"
							style={{
								shadowColor: '#444ebb',
								shadowOffset: { width: 0, height: 4 },
								shadowOpacity: 0.3,
								shadowRadius: 8,
								elevation: 4,
							}}>
							<LoginIcon
								size={20}
								color="#fff"
							/>
							<Text className="text-primary-foreground font-bold text-lg">
								Sign In
							</Text>
						</LinearGradient>
					</Pressable>

					{/* Secondary Sign Up Button */}
					<Pressable
						onPress={() => navigation.navigate('SignUp')}
						className="border-2 border-primary rounded-xl py-5 px-6 bg-card/50 active:opacity-70"
						style={({ pressed }) => ({
							transform: [{ scale: pressed ? 0.98 : 1 }],
						})}>
						<View className="flex-row items-center justify-center">
							<Icon
								name="person-add-outline"
								size={20}
								color="#444ebb"
								style={{ marginRight: 8 }}
							/>
							<Text className="text-primary font-bold text-lg">
								Create Account
							</Text>
						</View>
					</Pressable>
				</View>

				{/* Footer */}
				<View className="absolute bottom-12 items-center">
					<View className="flex-row items-center gap-2 mb-2">
						<Icon
							name="shield-checkmark"
							size={16}
							color="#444ebb"
						/>
						<Text className="text-muted-foreground text-sm">Secure</Text>
						<Text className="text-muted-foreground">•</Text>
						<Icon
							name="flash"
							size={16}
							color="#444ebb"
						/>
						<Text className="text-muted-foreground text-sm">Fast</Text>
						<Text className="text-muted-foreground">•</Text>
						<Icon
							name="star"
							size={16}
							color="#444ebb"
						/>
						<Text className="text-muted-foreground text-sm">Reliable</Text>
					</View>
					<Text className="text-muted-foreground text-xs">Version 1.0.0</Text>
				</View>
			</View>
		</View>
	);
}
