import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../providers/ThemeProvider';
import { useModal } from '../../providers/ModalProvider';
import { ChevronRightIcon } from 'src/assets/icons';

type Props = NativeStackScreenProps<AccountStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
	const { colors } = useTheme();
	const { showAlert } = useModal();
	const [businessName, setBusinessName] = React.useState('Acme Corporation');
	const [description, setDescription] = React.useState(
		'Global supplier of office supplies and equipment',
	);
	const [loading, setLoading] = React.useState(false);

	const handleSave = async () => {
		setLoading(true);
		try {
			// TODO: Implement save logic with API
			console.log('Saving profile:', { businessName, description });
			showAlert({
				title: 'Success',
				message: 'Your profile has been updated successfully.',
				type: 'success',
				confirmText: 'OK',
				onConfirm: () => navigation.goBack(),
			});
		} catch (error) {
			console.error('Save error:', error);
			showAlert({
				title: 'Error',
				message: 'Failed to update profile. Please try again.',
				type: 'error',
				confirmText: 'OK',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleGenerateLink = () => {
		showAlert({
			title: 'Generate New Link',
			message:
				'This will invalidate your old shareable link. Are you sure you want to continue?',
			type: 'warning',
			confirmText: 'Generate',
			cancelText: 'Cancel',
			isDestructive: true,
			onConfirm: () => {
				// TODO: Implement link generation
				showAlert({
					title: 'Success',
					message: 'New link has been generated successfully.',
					type: 'success',
					confirmText: 'OK',
				});
			},
		});
	};

	return (
		<ScrollView
			className="flex-1 bg-background"
			showsVerticalScrollIndicator={false}>
			<View className="p-6">
				{/* Header */}
				<View className="mb-6">
					<Pressable
						className="mb-4 flex-row items-center"
						onPress={() => navigation.goBack()}>
						<View className="rotate-180 mr-1">
							<ChevronRightIcon
								size={20}
								color={colors.primary}
							/>
						</View>
						<Text className="text-primary text-lg font-medium">Back</Text>
					</Pressable>

					<Text className="text-3xl font-bold text-foreground mb-2">
						Edit Profile
					</Text>
					<Text className="text-muted-foreground">
						Update your vendor information
					</Text>
				</View>

				{/* Form */}
				<View className="card-3d rounded-2xl p-6 mb-6">
					{/* Profile Image */}
					<View className="items-center mb-6">
						<View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-3">
							<Text className="text-4xl text-primary-foreground">📸</Text>
						</View>
						<Pressable className="bg-muted px-5 py-2.5 rounded-xl active:opacity-80">
							<Text className="text-foreground font-semibold">
								Change Photo
							</Text>
						</Pressable>
					</View>

					{/* Business Name */}
					<View className="mb-5">
						<Text className="text-foreground font-semibold mb-2">
							Business Name
						</Text>
						<TextInput
							className="bg-muted border border-border rounded-xl p-4 text-foreground"
							placeholder="Your business name"
							placeholderTextColor={colors.mutedForeground}
							value={businessName}
							onChangeText={setBusinessName}
						/>
					</View>

					{/* Description */}
					<View className="mb-6">
						<Text className="text-foreground font-semibold mb-2">
							Description
						</Text>
						<TextInput
							className="bg-muted border border-border rounded-xl p-4 text-foreground"
							placeholder="Brief description of your business"
							placeholderTextColor={colors.mutedForeground}
							value={description}
							onChangeText={setDescription}
							multiline
							numberOfLines={4}
							textAlignVertical="top"
							style={{ minHeight: 100 }}
						/>
					</View>

					{/* Save Button */}
					<Pressable
						className="btn-3d bg-primary p-4 rounded-xl items-center active:opacity-80"
						onPress={handleSave}
						disabled={loading}>
						<Text className="text-primary-foreground font-bold text-lg">
							{loading ? 'Saving...' : 'Save Changes'}
						</Text>
					</Pressable>
				</View>

				{/* Shareable Link Management */}
				<View className="card-3d rounded-2xl p-6 mb-6">
					<Text className="text-foreground font-bold text-lg mb-3">
						Shareable Link
					</Text>

					<View className="bg-muted p-4 rounded-xl mb-4">
						<Text
							className="text-foreground font-mono text-sm"
							selectable={true}>
							https://uploaddoc.app/v/vendor123
						</Text>
					</View>

					<Pressable
						className="bg-destructive p-4 rounded-xl items-center active:opacity-80"
						onPress={handleGenerateLink}>
						<Text className="text-destructive-foreground font-semibold">
							Generate New Link
						</Text>
					</Pressable>

					<Text className="text-muted-foreground text-xs mt-3 text-center">
						⚠️ Warning: This will invalidate your current link
					</Text>
				</View>
			</View>
		</ScrollView>
	);
}
