import React, { useState } from 'react';
import { View, Pressable, ActivityIndicator, Linking } from 'react-native';
import { TextComponent } from 'src/components';
import { useQuery } from '@tanstack/react-query';
import { getUserStatus } from '../../../api/auth';
import {
	getAllCloudStatus,
	getActiveProvider,
	getCloudSyncEligibility,
} from '../../../api/cloudSync';
import CoinsIcon from '../../../assets/icons/coins.icon';
import DocumentTextIcon from '../../../assets/icons/document-text.icon';
import CloudIcon from '../../../assets/icons/cloud.icon';
import CloudOffIcon from '../../../assets/icons/cloud-off.icon';
import LinkIcon from '../../../assets/icons/link.icon';
import CopyIcon from '../../../assets/icons/copy.icon';
import CheckmarkCircleIcon from '../../../assets/icons/checkmark-circle.icon';
import ExternalLinkIcon from '../../../assets/icons/external-link.icon';
import ChevronRightIcon from '../../../assets/icons/chevron-right.icon';
import { showMessage } from 'react-native-flash-message';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../../types/navigation.types';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useTheme } from '../../../providers/ThemeProvider';

type NavigationProp = NativeStackNavigationProp<MainTabParamList>;

const DashboardHeader = () => {
	const navigation = useNavigation<NavigationProp>();
	const { colors, colorScheme } = useTheme();
	const [copied, setCopied] = useState(false);

	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ['userStatus'],
		queryFn: getUserStatus,
	});

	const { data: cloudData, isLoading: cloudLoading } = useQuery({
		queryKey: ['allCloudStatus'],
		queryFn: getAllCloudStatus,
		staleTime: 60000,
	});

	const copyToClipboard = async (slug: string) => {
		const url = `https://uploaddoc.app/submit/${slug}`;
		await Clipboard.setStringAsync(url);
		setCopied(true);
		showMessage({
			message: 'Link Copied',
			description: 'Shareable link copied to clipboard',
			type: 'success',
			icon: 'success',
		});
		setTimeout(() => setCopied(false), 2000);
	};

	if (isLoading) {
		return (
			<View className="flex-row flex-wrap justify-between gap-y-3 mb-6 px-4 pt-2">
				{[1, 2, 3, 4].map((i) => (
					<View
						key={i}
						className="bg-card border border-border rounded-[22px] p-4 w-[48%] h-32 justify-between shadow-sm">
						<View className="flex-row justify-between items-start">
							<Skeleton className="h-4 w-16 rounded" />
							<Skeleton className="h-6 w-6 rounded-lg" />
						</View>
						<View>
							<Skeleton className="h-8 w-12 rounded mb-1" />
							<Skeleton className="h-3 w-20 rounded" />
						</View>
					</View>
				))}
			</View>
		);
	}

	if (isError) {
		return (
			<View className="mx-4 mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-[22px] flex-row items-center justify-between">
				<TextComponent className="text-destructive flex-1 mr-2 text-sm font-medium">
					Failed to load status
				</TextComponent>
				<Pressable
					onPress={() => refetch()}
					className="bg-destructive px-4 py-2 rounded-lg active:opacity-80">
					<TextComponent className="text-destructive-foreground font-bold text-xs">
						Retry
					</TextComponent>
				</Pressable>
			</View>
		);
	}

	const user = data?.data?.data?.user;
	const activeProvider = cloudData ? getActiveProvider(cloudData) : null;
	const eligibility = cloudData
		? getCloudSyncEligibility(cloudData)
		: { canUseDriveSync: false };

	const activeStatus = activeProvider
		? {
				connected: true,
				provider: activeProvider.providerName,
				driveEmail: activeProvider.status.driveEmail,
				canAutoSync: activeProvider.status.canAutoSync,
				autoSync: activeProvider.status.autoSync,
				canUseDriveSync: eligibility.canUseDriveSync,
			}
		: {
				connected: false,
				provider: null,
				driveEmail: null,
				canAutoSync: false,
				autoSync: false,
				canUseDriveSync: eligibility.canUseDriveSync,
			};

	if (!user) return null;

	return (
		<View className="px-4 mb-6">
			<View className="flex-row flex-wrap justify-between gap-y-3 px-0.5">
				{/* Tokens Card */}
				<View className="bg-card border border-border rounded-[22px] p-4 w-[48%] shadow-sm justify-between min-h-[98px]">
					<View className="flex-row justify-between items-center mb-2">
						<TextComponent className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
							Tokens
						</TextComponent>
						<View className="h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10">
							<CoinsIcon
								size={13}
								color={colorScheme === 'dark' ? '#f59e0b' : '#d97706'}
							/>
						</View>
					</View>
					<TextComponent className="text-2xl font-black text-foreground">
						{user.documentToken}
					</TextComponent>
					<TextComponent className="text-[10px] text-muted-foreground mt-0.5">
						Current balance
					</TextComponent>
				</View>

				{/* Documents Card */}
				<View className="bg-card border border-border rounded-[22px] p-4 w-[48%] shadow-sm justify-between min-h-[98px]">
					<View className="flex-row justify-between items-center mb-2">
						<TextComponent className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
							Received
						</TextComponent>
						<View className="h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
							<DocumentTextIcon
								size={13}
								color={colors.primary}
							/>
						</View>
					</View>
					<TextComponent className="text-2xl font-black text-foreground">
						{user.documentsReceived}
					</TextComponent>
					<TextComponent className="text-[10px] text-muted-foreground mt-0.5">
						Total submissions
					</TextComponent>
				</View>

				{/* Cloud Sync Card */}
				<Pressable 
					onPress={() => navigation.navigate('AccountTab', { screen: 'CloudSync' })}
					className="bg-card border border-border rounded-[22px] p-4 w-[48%] shadow-sm justify-between min-h-[98px] active:opacity-80">
					<View className="flex-row justify-between items-center mb-2">
						<TextComponent className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
							Cloud Sync
						</TextComponent>
						<View className={`h-6 w-6 items-center justify-center rounded-lg ${activeStatus.connected ? 'bg-emerald-500/10' : 'bg-muted'}`}>
							{cloudLoading ? (
								<ActivityIndicator
									size="small"
									color={colors.mutedForeground}
								/>
							) : activeStatus.connected ? (
								<CloudIcon
									size={13}
									color={colorScheme === 'dark' ? '#10b981' : '#059669'}
								/>
							) : (
								<CloudOffIcon
									size={13}
									color={colors.mutedForeground}
								/>
							)}
						</View>
					</View>

					{cloudLoading ? (
						<TextComponent className="text-[10px] text-muted-foreground">
							Loading...
						</TextComponent>
					) : activeStatus.connected ? (
						<View>
							<View className="flex-row items-center mb-1">
								<View className="bg-emerald-500/10 px-1.5 py-0.5 rounded">
									<TextComponent className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3px]">
										{activeStatus.provider?.replace('-', ' ')}
									</TextComponent>
								</View>
							</View>
							<TextComponent
								className="text-[10px] font-bold text-foreground truncate"
								numberOfLines={1}>
								{activeStatus.driveEmail}
							</TextComponent>
						</View>
					) : activeStatus.canUseDriveSync ? (
						<View>
							<TextComponent className="text-[10px] font-bold text-muted-foreground mb-1">
								Not connected
							</TextComponent>
							<View className="flex-row items-center gap-0.5">
								<TextComponent className="text-[10px] text-primary font-black">
									Connect
								</TextComponent>
								<ChevronRightIcon
									size={8}
									color={colors.primary}
								/>
							</View>
						</View>
					) : (
						<View>
							<TextComponent className="text-[10px] font-bold text-muted-foreground mb-1">
								Upgrade to unlock
							</TextComponent>
							<View className="flex-row items-center gap-0.5">
								<TextComponent className="text-[10px] text-primary font-black">
									View plans
								</TextComponent>
								<ChevronRightIcon
									size={8}
									color={colors.primary}
								/>
							</View>
						</View>
					)}
				</Pressable>

				{/* Share Link Card */}
				<View className="bg-card border border-border rounded-[22px] p-4 w-[48%] shadow-sm justify-between min-h-[98px]">
					<View className="flex-row justify-between items-center mb-2">
						<TextComponent className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
							Link
						</TextComponent>
						<View className="h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10">
							<LinkIcon
								size={13}
								color={colors.primary}
							/>
						</View>
					</View>

					{user.slug ? (
						<View>
							<View className="flex-row items-center gap-1.5 bg-muted/40 dark:bg-muted/20 border border-border rounded-lg p-1.5 mb-1 justify-between">
								<TextComponent
									className="text-[10px] font-mono text-foreground truncate flex-1"
									numberOfLines={1}>
									/{user.slug}
								</TextComponent>
								<Pressable
									onPress={() => copyToClipboard(user.slug!)}
									className="p-1 bg-card rounded-md shadow-sm border border-border active:scale-90 items-center justify-center">
									{copied ? (
										<CheckmarkCircleIcon
											size={10}
											color="#22c55e"
										/>
									) : (
										<CopyIcon
											size={10}
											color={colors.mutedForeground}
										/>
									)}
								</Pressable>
							</View>
							<TextComponent className="text-[10px] text-muted-foreground">
								Share for submissions
							</TextComponent>
						</View>
					) : (
						<View>
							<TextComponent className="text-[10px] font-bold text-muted-foreground mb-1">
								No custom link
							</TextComponent>
							<Pressable
								onPress={() => navigation.navigate('AccountTab' as any)}
								className="active:scale-95 flex-row items-center gap-0.5">
								<TextComponent className="text-[10px] text-primary font-black">
									Set up
								</TextComponent>
								<ExternalLinkIcon
									size={8}
									color={colors.primary}
								/>
							</Pressable>
						</View>
					)}
				</View>
			</View>
		</View>
	);
};

export default React.memo(DashboardHeader);
