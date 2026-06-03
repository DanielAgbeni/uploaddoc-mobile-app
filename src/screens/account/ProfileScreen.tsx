import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { AccountStackParamList } from '../../types/navigation.types';
import { useUserStore } from '../../shared/user-store/useUserStore';
import { useTheme, ThemeMode } from '../../providers/ThemeProvider';
import { useModal } from '../../providers/ModalProvider';
import {
	MoonIcon,
	SunIcon,
	MonitorIcon,
	BellIcon,
	LogOutIcon,
	ChevronRightIcon,
	ExternalLinkIcon,
	EditIcon,
	HistoryIcon,
} from 'src/assets/icons';
import { CustomImage, TextComponent } from 'src/components';
import CloudIcon from '../../assets/icons/cloud.icon';
import { registerForPushNotificationsAsync } from '../../services/NotificationService';
import {
	subscribeToPushNotifications,
	unsubscribeFromPushNotifications,
} from '../../api/notifications';
import * as SecureStore from 'expo-secure-store';

type Props = NativeStackScreenProps<AccountStackParamList, 'Profile'>;

// Reusable setting row component
interface SettingRowProps {
	icon: React.ReactNode;
	title: string;
	subtitle?: string;
	onPress?: () => void;
	rightElement?: React.ReactNode;
	showChevron?: boolean;
	isDestructive?: boolean;
}

const SettingRow = memo(function SettingRow({
	icon,
	title,
	subtitle,
	onPress,
	rightElement,
	showChevron = true,
	isDestructive = false,
}: SettingRowProps) {
	const { colors } = useTheme();

	return (
		<Pressable
			className="flex-row items-center py-4 active:opacity-70"
			onPress={onPress}
			disabled={!onPress}>
			<View
				className={`w-10 h-10 rounded-xl items-center justify-center ${
					isDestructive ? 'bg-destructive/15' : 'bg-primary/10'
				}`}>
				{icon}
			</View>
			<View className="flex-1 ml-3">
				<TextComponent
					className={`font-bold text-base ${
						isDestructive ? 'text-destructive' : 'text-foreground'
					}`}>
					{title}
				</TextComponent>
				{subtitle ? (
					<TextComponent 
						className="text-muted-foreground text-sm mt-0.5 font-medium"
						style={{ opacity: 0.7 }}>
						{subtitle}
					</TextComponent>
				) : null}
			</View>
			{rightElement}
			{showChevron && onPress ? (
				<ChevronRightIcon
					size={20}
					color={isDestructive ? colors.destructive : colors.mutedForeground}
				/>
			) : null}
		</Pressable>
	);
});

// Separator component
const Separator = memo(function Separator() {
	return <View className="h-px bg-border" />;
});

function ProfileScreen({ navigation }: Props) {
	const { theme, setTheme, colors, colorScheme } = useTheme();
	const { showAlert } = useModal();
	const user = useUserStore((state) => state.user);
	const logout = useUserStore((state) => state.logout);
	const [notifications, setNotifications] = useState(false);

	const checkNotificationStatus = useCallback(async () => {
		const token = await SecureStore.getItemAsync('push_token');
		setNotifications(!!token);
	}, []);

	useEffect(() => {
		checkNotificationStatus();
	}, [checkNotificationStatus]);

	const isVendor = user?.isAdmin || false;

	const handleToggleNotifications = useCallback(async () => {
		try {
			const newValue = !notifications;
			setNotifications(newValue);

			if (newValue) {
				const token = await registerForPushNotificationsAsync();
				if (token && user?.id) {
					await subscribeToPushNotifications(user.id, token);
					await SecureStore.setItemAsync('push_token', token);
					showAlert({
						title: 'Success',
						message: 'Push notifications enabled',
						type: 'success',
					});
				} else {
					setNotifications(false);
					showAlert({
						title: 'Permission Required',
						message: 'Please enable notifications in your device settings',
						type: 'error',
					});
				}
			} else {
				const token = await SecureStore.getItemAsync('push_token');
				if (token && user?.id) {
					await unsubscribeFromPushNotifications(user.id, token);
					await SecureStore.deleteItemAsync('push_token');
				}
			}
		} catch (error) {
			console.error('Error toggling notifications:', error);
			setNotifications((prev) => !prev);
			showAlert({
				title: 'Error',
				message: 'Failed to update notification settings',
				type: 'error',
			});
		}
	}, [notifications, user?.id, showAlert]);

	const handleLogout = useCallback(() => {
		showAlert({
			title: 'Logout',
			message: 'Are you sure you want to logout?',
			type: 'confirm',
			isDestructive: true,
			confirmText: 'Logout',
			cancelText: 'Cancel',
			onConfirm: () => {
				logout();
			},
		});
	}, [logout, showAlert]);

	const handleOpenLink = useCallback((url: string, title: string) => {
		showAlert({
			title: title,
			message: `This will open ${url} in your browser.`,
			type: 'info',
			confirmText: 'Open',
			onConfirm: () => {
				// TODO: Implement linking with Linking.openURL(url)
			},
		});
	}, [showAlert]);

	const handleNavigateToEditProfile = useCallback(() => {
		navigation.navigate('EditProfile');
	}, [navigation]);

	const handleNavigateToTransactionHistory = useCallback(() => {
		navigation.navigate('TransactionHistory');
	}, [navigation]);

	const handleNavigateToCloudSync = useCallback(() => {
		navigation.navigate('CloudSync');
	}, [navigation]);

	const handleOpenPrivacyPolicy = useCallback(() => {
		handleOpenLink('https://uploaddoc.app/privacy-policy', 'Privacy Policy');
	}, [handleOpenLink]);

	const handleOpenTermsOfService = useCallback(() => {
		handleOpenLink('https://uploaddoc.app/terms-of-service', 'Terms of Service');
	}, [handleOpenLink]);

	const handleSetThemeLight = useCallback(() => {
		setTheme('light');
	}, [setTheme]);

	const handleSetThemeDark = useCallback(() => {
		setTheme('dark');
	}, [setTheme]);

	const handleSetThemeSystem = useCallback(() => {
		setTheme('system');
	}, [setTheme]);

	if (!user) {
		return null;
	}

	return (
		<ScrollView
			className="flex-1 bg-background"
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ paddingBottom: 120 }}>
			{/* Gradient Header with Avatar */}
			<LinearGradient
				colors={[colors.primary, colors.accent]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				className="pt-14 pb-8 px-6 rounded-b-3xl">
				<View className="items-center">
					{/* Avatar */}
					<View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4 border-4 border-white/30 overflow-hidden shadow-md">
						<CustomImage
							source={user?.profilePicture}
							className="w-full h-full"
						/>
					</View>

					{/* User Info */}
					<TextComponent className="text-white font-black text-2xl mb-1 tracking-tight">
						{user?.name}
					</TextComponent>
					<TextComponent className="text-white/80 text-sm font-semibold mb-3">
						{user?.email}
					</TextComponent>

					{/* Account Badge */}
					<View className="bg-white/15 px-3 py-1 rounded-full border border-white/10 shadow-sm">
						<TextComponent className="text-white font-bold text-xs uppercase tracking-[0.8px]">
							{isVendor ? '✓ Vendor Account' : 'User Account'}
						</TextComponent>
					</View>
				</View>
			</LinearGradient>

			<View className="px-5 pt-6">
				{/* Vendor-Only Options */}
				{isVendor ? (
					<View className="mb-6">
						<TextComponent className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-3 px-1">
							Vendor Options
						</TextComponent>

						<View className="bg-card border border-border rounded-[24px] px-5 shadow-sm">
							<SettingRow
								icon={
									<EditIcon
										size={20}
										color={colors.primary}
									/>
								}
								title="Edit Profile"
								subtitle="Update vendor information"
								onPress={handleNavigateToEditProfile}
							/>
							<Separator />
							<SettingRow
								icon={
									<HistoryIcon
										size={20}
										color={colors.primary}
									/>
								}
								title="Transaction History"
								subtitle="View token purchases & usage"
								onPress={handleNavigateToTransactionHistory}
							/>
						</View>
					</View>
				) : null}

				{/* Preferences Section */}
				<View className="mb-6">
					<TextComponent className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-3 px-1">
						Preferences
					</TextComponent>

					<View className="bg-card border border-border rounded-[24px] px-5 shadow-sm">
						{/* Notifications */}
						<SettingRow
							icon={
								<BellIcon
									size={20}
									color={colors.primary}
								/>
							}
							title="Push Notifications"
							subtitle="Receive updates about your documents"
							showChevron={false}
							rightElement={
								<Switch
									value={notifications}
									onValueChange={handleToggleNotifications}
									trackColor={{
										false: colors.muted,
										true: colors.primary + '40',
									}}
									thumbColor={notifications ? colors.primary : colors.border}
								/>
							}
						/>
						<Separator />

						{/* Theme Selector */}
						<View className="py-4">
							<View className="flex-row items-center mb-4">
								<View className="w-10 h-10 rounded-xl items-center justify-center bg-primary/10">
									{colorScheme === 'dark' ? (
										<MoonIcon
											size={20}
											color={colors.primary}
										/>
									) : (
										<SunIcon
											size={20}
											color={colors.primary}
										/>
									)}
								</View>
								<View className="flex-1 ml-3">
									<TextComponent className="text-foreground font-bold text-base">
										Appearance
									</TextComponent>
									<TextComponent 
										className="text-muted-foreground text-sm mt-0.5 font-medium"
										style={{ opacity: 0.7 }}>
										Choose your preferred theme
									</TextComponent>
								</View>
							</View>

							{/* Theme Toggle Buttons */}
							<View className="flex-row bg-background rounded-xl p-1 border border-border">
								<Pressable
									onPress={handleSetThemeLight}
									className={`flex-1 flex-row items-center justify-center py-2.5 px-2 rounded-lg ${
										theme === 'light' ? 'bg-primary' : ''
									}`}>
									<View className="mr-1.5">
										<SunIcon
											size={16}
											color={theme === 'light' ? colors.primaryForeground : colors.foreground}
										/>
									</View>
									<TextComponent
										className={`font-bold text-sm ${
											theme === 'light'
												? 'text-primary-foreground'
												: 'text-foreground'
										}`}>
										Light
									</TextComponent>
								</Pressable>

								<Pressable
									onPress={handleSetThemeDark}
									className={`flex-1 flex-row items-center justify-center py-2.5 px-2 rounded-lg ${
										theme === 'dark' ? 'bg-primary' : ''
									}`}>
									<View className="mr-1.5">
										<MoonIcon
											size={16}
											color={theme === 'dark' ? colors.primaryForeground : colors.foreground}
										/>
									</View>
									<TextComponent
										className={`font-bold text-sm ${
											theme === 'dark'
												? 'text-primary-foreground'
												: 'text-foreground'
										}`}>
										Dark
									</TextComponent>
								</Pressable>

								<Pressable
									onPress={handleSetThemeSystem}
									className={`flex-1 flex-row items-center justify-center py-2.5 px-2 rounded-lg ${
										theme === 'system' ? 'bg-primary' : ''
									}`}>
									<View className="mr-1.5">
										<MonitorIcon
											size={16}
											color={theme === 'system' ? colors.primaryForeground : colors.foreground}
										/>
									</View>
									<TextComponent
										className={`font-bold text-sm ${
											theme === 'system'
												? 'text-primary-foreground'
												: 'text-foreground'
										}`}>
										Auto
									</TextComponent>
								</Pressable>
							</View>
						</View>
						<Separator />
						<SettingRow
							icon={
								<CloudIcon
									size={20}
									color={colors.primary}
								/>
							}
							title="Cloud Storage"
							subtitle="Sync documents to Drive, OneDrive, or Dropbox"
							onPress={handleNavigateToCloudSync}
						/>
					</View>
				</View>

				{/* Legal Section */}
				<View className="mb-6">
					<TextComponent className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-3 px-1">
						Legal
					</TextComponent>

					<View className="bg-card border border-border rounded-[24px] px-5 shadow-sm">
						<SettingRow
							icon={
								<ExternalLinkIcon
									size={20}
									color={colors.primary}
								/>
							}
							title="Privacy Policy"
							onPress={handleOpenPrivacyPolicy}
						/>
						<Separator />
						<SettingRow
							icon={
								<ExternalLinkIcon
									size={20}
									color={colors.primary}
								/>
							}
							title="Terms of Service"
							onPress={handleOpenTermsOfService}
						/>
					</View>
				</View>

				{/* Danger Zone */}
				<View className="mb-6">
					<TextComponent className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-3 px-1">
						Account
					</TextComponent>

					<View className="bg-card border border-border rounded-[24px] px-5 shadow-sm">
						<SettingRow
							icon={
								<LogOutIcon
									size={20}
									color={colors.destructive}
								/>
							}
							title="Logout"
							subtitle="Sign out of your account"
							onPress={handleLogout}
							isDestructive
						/>
					</View>
				</View>

				{/* App Version */}
				<TextComponent className="text-center text-muted-foreground text-xs mt-4">
					UploadDoc v2.1.0
				</TextComponent>
			</View>
		</ScrollView>
	);
}

export default memo(ProfileScreen);
