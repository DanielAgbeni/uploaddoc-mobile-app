import React, { memo } from 'react';
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
	UserIcon,
	LogOutIcon,
	ChevronRightIcon,
	ExternalLinkIcon,
	EditIcon,
	HistoryIcon,
} from 'src/assets/icons';
import { CustomImage, TextComponent } from 'src/components';
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

const SettingRow: React.FC<SettingRowProps> = ({
	icon,
	title,
	subtitle,
	onPress,
	rightElement,
	showChevron = true,
	isDestructive = false,
}) => {
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
				<Text
					className={`font-semibold text-base ${
						isDestructive ? 'text-destructive' : 'text-foreground'
					}`}>
					{title}
				</Text>
				{subtitle && (
					<Text className="text-muted-foreground text-sm mt-0.5">
						{subtitle}
					</Text>
				)}
			</View>
			{rightElement}
			{showChevron && onPress && (
				<ChevronRightIcon
					size={20}
					color={isDestructive ? colors.destructive : colors.mutedForeground}
				/>
			)}
		</Pressable>
	);
};

// Separator component
const Separator = () => <View className="h-px bg-border" />;

function ProfileScreen({ navigation }: Props) {
	const { theme, setTheme, colors, colorScheme } = useTheme();
	const { showAlert } = useModal();
	const user = useUserStore((state) => state.user);
	const logout = useUserStore((state) => state.logout);
	const [notifications, setNotifications] = React.useState(false);

	React.useEffect(() => {
		checkNotificationStatus();
	}, []);

	const checkNotificationStatus = async () => {
		const token = await SecureStore.getItemAsync('push_token');
		setNotifications(!!token);
	};

	const isVendor = user?.isAdmin || false;

	const handleToggleNotifications = async () => {
		try {
			const newValue = !notifications;
			setNotifications(newValue);

			if (newValue) {
				// Turning on
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
					// Failed to get token or permission denied
					setNotifications(false);
					showAlert({
						title: 'Permission Required',
						message: 'Please enable notifications in your device settings',
						type: 'error',
					});
				}
			} else {
				// Turning off
				const token = await SecureStore.getItemAsync('push_token');
				if (token && user?.id) {
					await unsubscribeFromPushNotifications(user.id, token);
					await SecureStore.deleteItemAsync('push_token');
				}
			}
		} catch (error) {
			console.error('Error toggling notifications:', error);
			// Revert state on error
			setNotifications(!notifications);
			showAlert({
				title: 'Error',
				message: 'Failed to update notification settings',
				type: 'error',
			});
		}
	};

	const handleLogout = () => {
		showAlert({
			title: 'Logout',
			message: 'Are you sure you want to logout?',
			type: 'confirm',
			isDestructive: true,
			confirmText: 'Logout',
			cancelText: 'Cancel',
			onConfirm: () => {
				logout();
				// Navigation will be handled automatically by RootNavigator
			},
		});
	};

	const handleOpenLink = (url: string, title: string) => {
		showAlert({
			title: title,
			message: `This will open ${url} in your browser.`,
			type: 'info',
			confirmText: 'Open',
			onConfirm: () => {
				// TODO: Implement linking with Linking.openURL(url)
			},
		});
	};

	const themeOptions: {
		value: ThemeMode;
		label: string;
		icon: React.ReactNode;
	}[] = [
		{
			value: 'light',
			label: 'Light',
			icon: (
				<SunIcon
					size={18}
					color={
						theme === 'light' ? colors.primaryForeground : colors.foreground
					}
				/>
			),
		},
		{
			value: 'dark',
			label: 'Dark',
			icon: (
				<MoonIcon
					size={18}
					color={
						theme === 'dark' ? colors.primaryForeground : colors.foreground
					}
				/>
			),
		},
		{
			value: 'system',
			label: 'Auto',
			icon: (
				<MonitorIcon
					size={18}
					color={
						theme === 'system' ? colors.primaryForeground : colors.foreground
					}
				/>
			),
		},
	];

	if (!user) {
		return null; // Should never happen if authenticated
	}

	return (
		<ScrollView
			className="flex-1 bg-background"
			showsVerticalScrollIndicator={false}>
			{/* Gradient Header with Avatar */}
			<LinearGradient
				colors={[colors.primary, colors.accent]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				className="pt-14 pb-8 px-6 rounded-b-3xl">
				<View className="items-center">
					{/* Avatar */}
					<View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4 border-4 border-white/30 overflow-hidden">
						<CustomImage
							source={user?.profilePicture}
							className="w-full h-full"
						/>
					</View>

					{/* User Info */}
					<TextComponent className="text-white font-bold text-2xl mb-1">
						{user?.name}
					</TextComponent>
					<TextComponent className="text-white/80 text-base mb-3">
						{user?.email}
					</TextComponent>

					{/* Account Badge */}
					<View className="bg-white/20 px-4 py-1.5 rounded-full">
						<TextComponent className="text-white font-semibold text-sm">
							{isVendor ? '✓ Vendor Account' : 'User Account'}
						</TextComponent>
					</View>
				</View>
			</LinearGradient>

			<View className="px-5 pt-6 pb-8">
				{/* Vendor-Only Options */}
				{isVendor && (
					<View className="mb-6">
						<TextComponent className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3 px-1">
							Vendor Options
						</TextComponent>

						<View className="card-3d rounded-2xl px-4">
							<SettingRow
								icon={
									<EditIcon
										size={20}
										color={colors.primary}
									/>
								}
								title="Edit Profile"
								subtitle="Update vendor information"
								onPress={() => navigation.navigate('EditProfile')}
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
								onPress={() => navigation.navigate('TransactionHistory')}
							/>
						</View>
					</View>
				)}

				{/* Preferences Section */}
				<View className="mb-6">
					<TextComponent className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3 px-1">
						Preferences
					</TextComponent>

					<View className="card-3d rounded-2xl px-4">
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
										true: colors.primary + '60',
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
									<TextComponent className="text-foreground font-semibold text-base">
										Appearance
									</TextComponent>
									<TextComponent className="text-muted-foreground text-sm mt-0.5">
										Choose your preferred theme
									</TextComponent>
								</View>
							</View>

							{/* Theme Toggle Buttons */}
							<View className="flex-row bg-muted rounded-xl p-1">
								{themeOptions.map((option) => (
									<Pressable
										key={option.value}
										onPress={() => setTheme(option.value)}
										className={`flex-1 flex-row items-center justify-center py-2.5 px-2 rounded-lg ${
											theme === option.value ? 'bg-primary' : ''
										}`}
										style={({ pressed }) => ({
											opacity: pressed ? 0.8 : 1,
										})}>
										<View className="mr-1.5">{option.icon}</View>
										<TextComponent
											className={`font-semibold text-sm ${
												theme === option.value
													? 'text-primary-foreground'
													: 'text-foreground'
											}`}>
											{option.label}
										</TextComponent>
									</Pressable>
								))}
							</View>
						</View>
					</View>
				</View>

				{/* Legal Section */}
				<View className="mb-6">
					<TextComponent className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3 px-1">
						Legal
					</TextComponent>

					<View className="card-3d rounded-2xl px-4">
						<SettingRow
							icon={
								<ExternalLinkIcon
									size={20}
									color={colors.primary}
								/>
							}
							title="Privacy Policy"
							onPress={() =>
								handleOpenLink(
									'https://uploaddoc.app/privacy-policy',
									'Privacy Policy',
								)
							}
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
							onPress={() =>
								handleOpenLink(
									'https://uploaddoc.app/terms-of-service',
									'Terms of Service',
								)
							}
						/>
					</View>
				</View>

				{/* Danger Zone */}
				<View className="mb-6">
					<TextComponent className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3 px-1">
						Account
					</TextComponent>

					<View className="card-3d rounded-2xl px-4">
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
					UploadDoc v2.0.11
				</TextComponent>
			</View>
		</ScrollView>
	);
}

export default memo(ProfileScreen);
