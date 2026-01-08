import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
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
import { showMessage } from 'react-native-flash-message';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../../types/navigation.types';

// Assuming MainTabParamList needs to be imported or used for type safety
type NavigationProp = NativeStackNavigationProp<MainTabParamList>;

const DashboardHeader = () => {
	const navigation = useNavigation<NavigationProp>();
	const [copied, setCopied] = useState(false);

	const { data, isLoading, isError, error } = useQuery({
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
			<View className="flex-row flex-wrap gap-3 mb-6 px-4">
				{[1, 2, 3, 4].map((i) => (
					<View
						key={i}
						className="bg-card border border-border rounded-xl p-4 w-[47%] h-32 justify-between animate-pulse">
						<View className="flex-row justify-between">
							<View className="h-4 w-16 bg-muted rounded" />
							<View className="h-4 w-4 bg-muted rounded" />
						</View>
						<View>
							<View className="h-8 w-12 bg-muted rounded mb-1" />
							<View className="h-3 w-20 bg-muted rounded" />
						</View>
					</View>
				))}
			</View>
		);
	}

	if (isError) {
		return (
			<View className="mx-4 mb-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg">
				<Text className="text-red-500 dark:text-red-400">
					Failed to load status: {(error as Error).message}
				</Text>
			</View>
		);
	}

	const user = data?.data?.data?.user;

	const activeProvider = getActiveProvider(cloudData?.data);
	const eligibility = getCloudSyncEligibility(cloudData?.data);

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
			<View className="flex-row flex-wrap gap-3">
				{/* Tokens Card */}
				<View className="bg-card border border-border rounded-xl p-4 w-[48%] shadow-sm">
					<View className="flex-row justify-between items-start mb-2">
						<Text className="text-xs font-medium text-muted-foreground">
							Tokens
						</Text>
						<CoinsIcon
							size={16}
							color="#94a3b8"
						/>
					</View>
					<Text className="text-2xl font-bold text-foreground">
						{user.documentToken}
					</Text>
					<Text className="text-[10px] text-muted-foreground">
						Current balance
					</Text>
				</View>

				{/* Documents Card */}
				<View className="bg-card border border-border rounded-xl p-4 w-[48%] shadow-sm">
					<View className="flex-row justify-between items-start mb-2">
						<Text className="text-xs font-medium text-muted-foreground">
							Received
						</Text>
						<DocumentTextIcon
							size={16}
							color="#94a3b8"
						/>
					</View>
					<Text className="text-2xl font-bold text-foreground">
						{user.documentsReceived}
					</Text>
					<Text className="text-[10px] text-muted-foreground">
						Total submissions
					</Text>
				</View>

				{/* Cloud Sync Card */}
				<View className="bg-card border border-border rounded-xl p-4 w-[48%] shadow-sm justify-between">
					<View className="flex-row justify-between items-start mb-1">
						<Text className="text-xs font-medium text-muted-foreground">
							Cloud Sync
						</Text>
						{cloudLoading ? (
							<ActivityIndicator
								size="small"
								color="#94a3b8"
							/>
						) : activeStatus.connected ? (
							<CloudIcon
								size={16}
								color="#22c55e"
							/>
						) : (
							<CloudOffIcon
								size={16}
								color="#94a3b8"
							/>
						)}
					</View>

					{cloudLoading ? (
						<Text className="text-xs text-muted-foreground">Loading...</Text>
					) : activeStatus.connected ? (
						<View>
							<View className="flex-row items-center gap-1 mb-1">
								<View className="bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
									<Text className="text-[10px] font-medium text-green-700 dark:text-green-400 capitalize">
										{activeStatus.provider?.replace('-', ' ')}
									</Text>
								</View>
							</View>
							<Text
								className="text-[10px] text-muted-foreground truncate"
								numberOfLines={1}>
								{activeStatus.driveEmail}
							</Text>
						</View>
					) : activeStatus.canUseDriveSync ? (
						<View>
							<Text className="text-[10px] text-muted-foreground mb-1">
								Not connected
							</Text>
							<Pressable
								onPress={() => navigation.navigate('AccountTab' as any)}>
								<View className="flex-row items-center">
									<Text className="text-[10px] text-primary font-medium">
										Connect
									</Text>
									<ExternalLinkIcon
										size={10}
										color="#4F46E5"
									/>
								</View>
							</Pressable>
						</View>
					) : (
						<View>
							<Text className="text-[10px] text-muted-foreground mb-1">
								Upgrade to unlock
							</Text>
							<Pressable
								onPress={() => navigation.navigate('AccountTab' as any)}>
								<View className="flex-row items-center">
									<Text className="text-[10px] text-primary font-medium">
										View plans
									</Text>
									<ExternalLinkIcon
										size={10}
										color="#4F46E5"
									/>
								</View>
							</Pressable>
						</View>
					)}
				</View>

				{/* Share Link Card */}
				<View className="bg-card border border-border rounded-xl p-4 w-[48%] shadow-sm justify-between">
					<View className="flex-row justify-between items-start mb-1">
						<Text className="text-xs font-medium text-muted-foreground">
							Link
						</Text>
						<LinkIcon
							size={16}
							color="#94a3b8"
						/>
					</View>

					{user.slug ? (
						<View>
							<View className="flex-row items-center gap-2 bg-muted/50 rounded p-1 mb-1">
								<Text
									className="text-[10px] font-mono text-foreground truncate flex-1"
									numberOfLines={1}>
									/{user.slug}
								</Text>
								<Pressable
									onPress={() => copyToClipboard(user.slug!)}
									className="p-1 bg-background rounded shadow-sm">
									{copied ? (
										<CheckmarkCircleIcon
											size={10}
											color="#22c55e"
										/>
									) : (
										<CopyIcon
											size={10}
											color="#64748b"
										/>
									)}
								</Pressable>
							</View>
							<Text className="text-[10px] text-muted-foreground">
								Share for submissions
							</Text>
						</View>
					) : (
						<View>
							<Text className="text-[10px] text-muted-foreground mb-1">
								No custom link
							</Text>
							<Pressable
								onPress={() => navigation.navigate('AccountTab' as any)}>
								<View className="flex-row items-center">
									<Text className="text-[10px] text-primary font-medium">
										Set up
									</Text>
									<ExternalLinkIcon
										size={10}
										color="#4F46E5"
									/>
								</View>
							</Pressable>
						</View>
					)}
				</View>
			</View>
		</View>
	);
};

export default DashboardHeader;
