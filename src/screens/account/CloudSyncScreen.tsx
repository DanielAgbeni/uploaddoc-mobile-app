import React, { memo, useEffect, useState, useMemo, useCallback } from 'react';
import { View, Switch, ActivityIndicator, Linking, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AxiosError } from 'axios';
import { AccountStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../providers/ThemeProvider';
import { ThemeColors } from '../../theme/colors';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showMessage } from 'react-native-flash-message';
import { TextComponent } from '../../components';
import { useUserStore } from '../../shared/user-store/useUserStore';
import { useModal } from '../../providers/ModalProvider';
import Svg, { Path, Defs, LinearGradient as SVGLinearGradient, Stop } from 'react-native-svg';
import { 
	CloudOff, 
	FolderSync, 
	Zap, 
	Crown, 
	CheckCircle2, 
	AlertCircle,
	ChevronLeft,
	RefreshCw
} from 'lucide-react-native';

// API Functions
import {
	getDriveStatus,
	connectDrive,
	disconnectDrive,
	toggleAutoSync as toggleGoogleAutoSync,
} from '../../api/googledrive';
import {
	getOneDriveStatus,
	connectOneDrive,
	disconnectOneDrive,
	toggleOneDriveAutoSync,
} from '../../api/onedrive';
import {
	getDropboxStatus,
	connectDropbox,
	disconnectDropbox,
	toggleDropboxAutoSync,
} from '../../api/dropbox';
import { getAllCloudStatus, getActiveProvider, getCloudSyncEligibility, CloudSyncResponse } from '../../api/cloudSync';

type Props = NativeStackScreenProps<AccountStackParamList, 'CloudSync'>;

interface LogoProps {
  size?: number;
  color?: string;
}

const GoogleDriveLogo = memo(({ size = 24, color = '#333333' }: LogoProps) => (
  <Svg width={size} height={size} viewBox="0 0 512 512">
    <Path
      d="M341.3 358.4H170.7L85.3 213.3 170.7 68.3h170.6l85.4 145-85.4 145.1zM193.3 315.7h125.4l62.7-102.4-62.7-102.4H193.3L130.6 213.3l62.7 102.4z"
      fill={color}
    />
    <Path
      d="M170.7 234.7h256v42.7h-256zM298.7 106.7l128 221.9-37 21.3-128-221.9zM213.3 106.7l37 21.3-128 221.9-37-21.3z"
      fill={color}
    />
  </Svg>
));

const OneDriveLogo = memo(({ size = 24, color = '#333333' }: LogoProps) => (
 <Svg width={size} height={size} viewBox="0 0 512 512">
    <Path
      d="M400.6 220.4c-3.1-61.9-54.2-110.4-116.6-110.4-44.1 0-82.7 24.3-102.7 60.1-12.7-9.7-28.7-15.3-45.9-15.3-40.4 0-73.4 31.8-75.3 71.6C24.4 235.3 0 268.4 0 307.7 0 353.9 37.4 391.5 83.6 391.5h116.7c13.7-28.5 42.6-47.9 75.7-47.9 29.8 0 56.1 15.6 70.9 39.1A91.7 91.7 0 00412 368.1c55.2 0 100-44.8 100-100 0-46.1-31.2-84.9-73.5-96.5.1-4 .1-7.7.1-11.2 0-14.7-2.8-29-8.1-42.2-6.5 13.9-10.4 29.5-10.4 46 0 16.9 4.1 32.8 11.2 46.9-12.1-5.1-25.2-7.8-39-7.8-1.1 0-2.1.1-3.2.1zM276 386.4c-23.4 0-42.4-19-42.4-42.4s19-42.4 42.4-42.4 42.4 19 42.4 42.4-19 42.4-42.4 42.4z"
      fill={color}
    />
  </Svg>
));

const DropboxLogo = memo(({ size = 24, color = '#333333' }: LogoProps) => (
  <Svg width={size} height={size} viewBox="0 0 512 512">
    <Path
      d="M256 21.1L107.1 118 256 214.9l148.9-96.9L256 21.1zM85.3 132.2L12.5 179.6l148.9 96.9 72.8-47.4-148.9-96.9zm341.4 0l-148.9 96.9 72.8 47.4 148.9-96.9-72.8-47.4zM256 250.7L107.1 347.6l148.9 96.9 148.9-96.9L256 250.7zM107.1 371.1v42.5l148.9 81.1 148.9-81.1v-42.5l-148.9 81.1-148.9-81.1z"
      fill={color}
    />
  </Svg>
));

// --- Animated Scale Pressable for Premium Micro-Interactions ---
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ScalePressableProps {
	children: React.ReactNode;
	onPress?: () => void;
	disabled?: boolean;
	className?: string;
	style?: any;
}

const ScalePressable = memo(function ScalePressable({ 
	children, 
	onPress, 
	disabled, 
	className, 
	style 
}: ScalePressableProps) {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.get() }],
	}));

	const handlePressIn = useCallback(() => {
		if (!disabled) {
			scale.set(withSpring(0.96, { damping: 15, stiffness: 200 }));
		}
	}, [scale, disabled]);

	const handlePressOut = useCallback(() => {
		if (!disabled) {
			scale.set(withSpring(1, { damping: 15, stiffness: 200 }));
		}
	}, [scale, disabled]);

	return (
		<AnimatedPressable
			onPress={onPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			disabled={disabled}
			className={className}
			style={[style, animatedStyle]}
		>
			{children}
		</AnimatedPressable>
	);
});

// --- Refactored Premium Provider Card Component ---
interface ProviderCardProps {
	id: 'google' | 'onedrive' | 'dropbox';
	name: string;
	brandColor: string;
	gradientColors: [string, string];
	logoComponent: React.ReactNode;
	statusData: {
		connected: boolean;
		driveEmail: string | null;
		autoSync: boolean;
		canAutoSync: boolean;
	} | undefined;
	anyConnected: boolean;
	isConnecting: boolean;
	isPendingDisconnect: boolean;
	isPendingAutoSync: boolean;
	colors: ThemeColors;
	onConnect: (id: 'google' | 'onedrive' | 'dropbox') => void;
	onDisconnect: (id: 'google' | 'onedrive' | 'dropbox') => void;
	onToggleAutoSync: (id: 'google' | 'onedrive' | 'dropbox', enabled: boolean) => void;
}

const ProviderCard = memo(function ProviderCard({
	id,
	name,
	brandColor,
	gradientColors,
	logoComponent,
	statusData,
	anyConnected,
	isConnecting,
	isPendingDisconnect,
	isPendingAutoSync,
	colors,
	onConnect,
	onDisconnect,
	onToggleAutoSync,
}: ProviderCardProps) {
	const isConnected = statusData?.connected ?? false;
	const isDisabled = anyConnected && !isConnected;

	const handleConnectPress = useCallback(() => {
		onConnect(id);
	}, [id, onConnect]);

	const handleDisconnectPress = useCallback(() => {
		onDisconnect(id);
	}, [id, onDisconnect]);

	const handleToggleAutoSyncPress = useCallback((enabled: boolean) => {
		onToggleAutoSync(id, enabled);
	}, [id, onToggleAutoSync]);

	return (
		<View 
			className={`mb-3 rounded-[24px] border overflow-hidden relative shadow-sm ${
				isConnected 
					? 'border-primary/20 shadow-md' 
					: 'bg-card/40 border-border/40'
			} ${isDisabled ? 'opacity-40' : ''}`}
		>
			{isConnected ? (
				<LinearGradient
					colors={gradientColors}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					className="p-5"
				>
					{/* Ambient left brand pill indicator */}
					<View 
						className="absolute left-0 top-6 w-1 h-12 rounded-r-full" 
						style={{ backgroundColor: brandColor }} 
					/>

					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center flex-1 mr-3">
							<View 
								className="w-12 h-12 rounded-2xl items-center justify-center shadow-inner border border-white/5"
								style={{ backgroundColor: `${brandColor}12` }}>
								{logoComponent}
							</View>
							<View className="ml-3 flex-1">
								<TextComponent className="font-black text-base text-foreground">
									{name}
								</TextComponent>
								<View className="flex-row items-center mt-1 flex-wrap">
									<CheckCircle2 size={12} color="#10b981" />
									<TextComponent className="text-xs text-emerald-600 dark:text-emerald-400 font-bold ml-1">
										Connected
									</TextComponent>
									{statusData?.driveEmail ? (
										<TextComponent 
											className="text-[11px] text-muted-foreground ml-1.5 font-semibold" 
											numberOfLines={1} 
											style={{ opacity: 0.8 }}
										>
											({statusData.driveEmail})
										</TextComponent>
									) : null}
								</View>
							</View>
						</View>

						<ScalePressable
							onPress={handleDisconnectPress}
							disabled={isPendingDisconnect}
							className="bg-destructive/10 border border-destructive/20 px-3.5 py-2 rounded-xl active:opacity-75"
						>
							{isPendingDisconnect ? (
								<ActivityIndicator size="small" color={colors.destructive} />
							) : (
								<TextComponent className="text-xs font-black text-destructive">
									Disconnect
								</TextComponent>
							)}
						</ScalePressable>
					</View>

					<View className="mt-4 pt-4 border-t border-border/30">
						<View className="flex-row items-center justify-between">
							<View className="flex-row items-center flex-1 mr-2">
								<FolderSync size={16} color={colors.primary} />
								<TextComponent className="text-sm text-foreground font-bold ml-2">
									Auto-sync Documents
								</TextComponent>
								{!statusData?.canAutoSync ? (
									<LinearGradient
										colors={['#fbbf24', '#f59e0b']}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 1 }}
										className="px-2 py-0.5 rounded-full ml-2"
									>
										<TextComponent className="text-[9px] rounded-md font-black text-white uppercase tracking-wider">
											PRO
										</TextComponent>
									</LinearGradient>
								) : null}
							</View>
						<Switch
  value={statusData?.canAutoSync ? (statusData?.autoSync ?? false) : false}
  onValueChange={handleToggleAutoSyncPress}
  disabled={!statusData?.canAutoSync || isPendingAutoSync}
  trackColor={{
    false: colors.border,
    true: colors.primary + '40',
  }}
  thumbColor={
    statusData?.canAutoSync && statusData?.autoSync 
      ? colors.primary 
      : colors.mutedForeground
  }
/>
						</View>
						{!statusData?.canAutoSync ? (
							<View className="flex-row gap-2 items-center mt-2.5 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
								<AlertCircle size={12} color="#d97706" />
								<TextComponent className="text-[10px] text-amber-800 dark:text-amber-300/80 ml-1.5 font-medium leading-4 flex-1">
									Auto-sync is only available on Professional and Enterprise plans.
								</TextComponent>
							</View>
						) : null}
					</View>
				</LinearGradient>
			) : (
				<View className="p-5 flex-row items-center justify-between">
					<View className="flex-row items-center flex-1 mr-3">
						<View className="w-12 h-12 rounded-2xl items-center justify-center bg-background/50 border border-border/30">
							{logoComponent}
						</View>
						<View className="ml-3 flex-1">
							<TextComponent className="font-black text-base text-foreground">
								{name}
							</TextComponent>
							<TextComponent className="text-xs text-muted-foreground mt-0.5 font-semibold" style={{ opacity: 0.7 }}>
								Not connected
							</TextComponent>
						</View>
					</View>

					<ScalePressable
						onPress={handleConnectPress}
						disabled={isDisabled || isConnecting}
						style={{ overflow: 'hidden', borderRadius: 12 }}
					>
						<LinearGradient
							colors={isDisabled ? ['#475569', '#334155'] : [brandColor, brandColor + 'dd']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={{ paddingHorizontal: 20, paddingVertical: 10 }}
						>
							{isConnecting ? (
								<ActivityIndicator size="small" color="#FFFFFF" />
							) : (
								<TextComponent className="text-xs font-black text-white">
									Connect
								</TextComponent>
							)}
						</LinearGradient>
					</ScalePressable>
				</View>
			)}
		</View>
	);
});

// --- Refactored Premium Usage Summary Component ---
interface UsageCardProps {
	colors: ThemeColors;
	colorScheme: 'light' | 'dark';
	statusPayload: {
		tierName?: string;
		dailySyncLimit: number;
		dailySyncsUsed?: number;
		syncsToday?: number;
		remainingSyncs?: number | 'Unlimited';
	};
}

const UsageCard = memo(function UsageCard({ colors, colorScheme, statusPayload }: UsageCardProps) {
	const dailyLimit = statusPayload.dailySyncLimit ?? 0;
	const syncsToday = statusPayload.syncsToday ?? statusPayload.dailySyncsUsed ?? 0;
	const remainingSyncs = statusPayload.remainingSyncs ?? Math.max(0, dailyLimit - syncsToday);

	const isUnlimited = dailyLimit === -1 || dailyLimit > 999 || remainingSyncs === 'Unlimited';
	const isDepleted = !isUnlimited && dailyLimit > 0 && typeof remainingSyncs === 'number' && remainingSyncs <= 0;
	const syncPercentage = isUnlimited || dailyLimit === 0 ? 0 : Math.min((syncsToday / dailyLimit) * 100, 100);

	return (
		<LinearGradient
			colors={colorScheme === 'dark' ? ['#0a1424', '#020710'] : ['#ddeaff', '#ebf4ff']}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
			className="border border-border/50 rounded-[28px] p-5 shadow-md relative overflow-hidden"
		>
			{/* Glowing Ambient Dot inside Card */}
			<View className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-xl" />

			<View className="flex-row justify-between items-center mb-4">
				<View>
					<View className="flex-row items-center">
						<View className="w-6 h-6 rounded-full bg-amber-500/10 items-center justify-center border border-amber-500/20">
							<Crown size={12} color="#fbbf24" />
						</View>
						<TextComponent className="font-black text-sm text-foreground ml-2">
							{statusPayload.tierName || 'Standard'} Subscription
						</TextComponent>
					</View>
					<TextComponent className="text-[10px] text-muted-foreground mt-1 font-medium" style={{ opacity: 0.7 }}>
						Your cloud sync service configuration
					</TextComponent>
				</View>
			</View>

			<View className="h-px bg-border/20 mb-4" />

			<View className="space-y-2">
				<View className="flex-row justify-between items-center text-sm mb-2">
					<View className="flex-row items-center">
						<View className="w-5 h-5 rounded-full bg-primary/15 items-center justify-center">
							<Zap size={10} color={colors.primary} />
						</View>
						<TextComponent className="text-sm font-semibold text-muted-foreground ml-2">
							Daily Sync Usage
						</TextComponent>
					</View>
					{isUnlimited ? (
						<TextComponent className="font-bold text-primary text-sm">
							Unlimited
						</TextComponent>
					) : (
						<TextComponent className={`font-black text-sm ${isDepleted ? 'text-destructive' : 'text-foreground'}`}>
							{syncsToday} / {dailyLimit} used
						</TextComponent>
					)}
				</View>
				
				{!isUnlimited ? (
					<View className="pt-1">
						{/* Progress Bar Track */}
						<View className="h-2.5 w-full bg-border/20 rounded-full overflow-hidden mb-3">
							<LinearGradient 
								colors={
									isDepleted 
										? ['#ef4444', '#b91c1c'] 
										: syncPercentage > 80 
											? ['#f97316', '#ea580c'] 
											: [colors.primary, colors.secondary]
								}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								className="h-full rounded-full" 
								style={{ width: `${syncPercentage || 1}%` }}
							/>
						</View>
						<View className="flex-row justify-between items-center">
							<View className="flex-row items-center flex-1 mr-2">
								{isDepleted ? (
									<AlertCircle size={12} color={colors.destructive} style={{ marginRight: 4 }} />
								) : null}
								<TextComponent className={`text-xs font-bold ${isDepleted ? 'text-destructive' : 'text-muted-foreground'}`}>
									{isDepleted ? 'No syncs remaining today' : `${remainingSyncs} syncs remaining`}
								</TextComponent>
							</View>
							<View className="bg-muted/10 px-2 py-0.5 rounded-full border border-border/20">
								<TextComponent className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">
									Resets daily
								</TextComponent>
							</View>
						</View>
					</View>
				) : null}
			</View>
		</LinearGradient>
	);
});

// --- Main Screen Component ---
function CloudSyncScreen({ route, navigation }: Props) {
	const queryClient = useQueryClient();
	const { colors, colorScheme } = useTheme();
	const { showAlert } = useModal();
	const user = useUserStore((state) => state.user);
	const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
	const insets = useSafeAreaInsets();

	// --- Queries ---
	const { data: cloudData, isLoading, isError, refetch } = useQuery({
		queryKey: ['allCloudStatus'],
		queryFn: getAllCloudStatus,
		refetchOnWindowFocus: true,
	});

	const activeProvider = useMemo(() => cloudData ? getActiveProvider(cloudData) : null, [cloudData]);
	const eligibility = useMemo(() => cloudData ? getCloudSyncEligibility(cloudData) : { canUseDriveSync: false }, [cloudData]);
	const anyConnected = !!activeProvider;

	// --- Deep Link Callback Parameter Handler ---
	const params = route.params;
	useEffect(() => {
		if (params?.drive) {
			if (params.drive === 'success') {
				let providerName = 'Cloud Storage';
				if (params.type === 'onedrive') providerName = 'OneDrive';
				else if (params.type === 'dropbox') providerName = 'Dropbox';
				else if (params.type === 'google' || !params.type) providerName = 'Google Drive';

				showMessage({
					message: 'Connection Successful',
					description: `${providerName} connected successfully as ${params.email || ''}`,
					type: 'success',
					icon: 'success',
				});
			} else if (params.drive === 'error') {
				showMessage({
					message: 'Connection Failed',
					description: params.message || 'Failed to connect cloud storage',
					type: 'danger',
					icon: 'danger',
				});
			}
			
			// Invalidate query to refresh status in local state
			queryClient.invalidateQueries({ queryKey: ['allCloudStatus'] });
			
			// Clear parameters to prevent repeat triggers
			navigation.setParams({
				drive: undefined,
				type: undefined,
				email: undefined,
				message: undefined,
			});
		}
	}, [params, navigation, queryClient]);

	// --- Disconnect Mutations ---
	const disconnectGoogle = useMutation({
		mutationFn: disconnectDrive,
		onSuccess: () => {
			showMessage({ message: 'Google Drive disconnected', type: 'success' });
			queryClient.invalidateQueries({ queryKey: ['allCloudStatus'] });
		},
		onError: (err: unknown) => {
			const axiosError = err as AxiosError<{ message?: string }>;
			showMessage({ 
				message: 'Disconnection Failed', 
				description: axiosError.response?.data?.message || 'Failed to disconnect Google Drive', 
				type: 'danger' 
			});
		}
	});

	const disconnectOneDriveMut = useMutation({
		mutationFn: disconnectOneDrive,
		onSuccess: () => {
			showMessage({ message: 'OneDrive disconnected', type: 'success' });
			queryClient.invalidateQueries({ queryKey: ['allCloudStatus'] });
		},
		onError: (err: unknown) => {
			const axiosError = err as AxiosError<{ message?: string }>;
			showMessage({ 
				message: 'Disconnection Failed', 
				description: axiosError.response?.data?.message || 'Failed to disconnect OneDrive', 
				type: 'danger' 
			});
		}
	});

	const disconnectDropboxMut = useMutation({
		mutationFn: disconnectDropbox,
		onSuccess: () => {
			showMessage({ message: 'Dropbox disconnected', type: 'success' });
			queryClient.invalidateQueries({ queryKey: ['allCloudStatus'] });
		},
		onError: (err: unknown) => {
			const axiosError = err as AxiosError<{ message?: string }>;
			showMessage({ 
				message: 'Disconnection Failed', 
				description: axiosError.response?.data?.message || 'Failed to disconnect Dropbox', 
				type: 'danger' 
			});
		}
	});

	// --- Auto-Sync Toggle Mutations ---
	const toggleGoogleAuto = useMutation({
		mutationFn: toggleGoogleAutoSync,
		onMutate: async (enabled) => {
			await queryClient.cancelQueries({ queryKey: ['allCloudStatus'] });
			const previousStatus = queryClient.getQueryData<CloudSyncResponse>(['allCloudStatus']);
			if (previousStatus) {
				queryClient.setQueryData<CloudSyncResponse>(['allCloudStatus'], {
					...previousStatus,
					google: previousStatus.google ? {
						...previousStatus.google,
						autoSync: enabled,
					} : undefined,
				});
			}
			return { previousStatus };
		},
		onError: (err: unknown, enabled, context) => {
			if (context?.previousStatus) {
				queryClient.setQueryData(['allCloudStatus'], context.previousStatus);
			}
			const axiosError = err as AxiosError<{ message?: string }>;
			showMessage({ 
				message: 'Update Failed', 
				description: axiosError.response?.data?.message || 'Failed to update setting', 
				type: 'danger' 
			});
		},
		onSuccess: (data) => {
			showMessage({ 
				message: data.autoSync ? 'Auto-sync enabled' : 'Auto-sync disabled', 
				type: 'success' 
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['allCloudStatus'] });
		},
	});

	const toggleOneDriveAuto = useMutation({
		mutationFn: toggleOneDriveAutoSync,
		onMutate: async (enabled) => {
			await queryClient.cancelQueries({ queryKey: ['allCloudStatus'] });
			const previousStatus = queryClient.getQueryData<CloudSyncResponse>(['allCloudStatus']);
			if (previousStatus) {
				queryClient.setQueryData<CloudSyncResponse>(['allCloudStatus'], {
					...previousStatus,
					onedrive: previousStatus.onedrive ? {
						...previousStatus.onedrive,
						autoSync: enabled,
					} : undefined,
				});
			}
			return { previousStatus };
		},
		onError: (err: unknown, enabled, context) => {
			if (context?.previousStatus) {
				queryClient.setQueryData(['allCloudStatus'], context.previousStatus);
			}
			const axiosError = err as AxiosError<{ message?: string }>;
			showMessage({ 
				message: 'Update Failed', 
				description: axiosError.response?.data?.message || 'Failed to update setting', 
				type: 'danger' 
			});
		},
		onSuccess: (data) => {
			showMessage({ 
				message: data.autoSync ? 'Auto-sync enabled' : 'Auto-sync disabled', 
				type: 'success' 
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['allCloudStatus'] });
		},
	});

	const toggleDropboxAuto = useMutation({
		mutationFn: toggleDropboxAutoSync,
		onMutate: async (enabled) => {
			await queryClient.cancelQueries({ queryKey: ['allCloudStatus'] });
			const previousStatus = queryClient.getQueryData<CloudSyncResponse>(['allCloudStatus']);
			if (previousStatus) {
				queryClient.setQueryData<CloudSyncResponse>(['allCloudStatus'], {
					...previousStatus,
					dropbox: previousStatus.dropbox ? {
						...previousStatus.dropbox,
						autoSync: enabled,
					} : undefined,
				});
			}
			return { previousStatus };
		},
		onError: (err: unknown, enabled, context) => {
			if (context?.previousStatus) {
				queryClient.setQueryData(['allCloudStatus'], context.previousStatus);
			}
			const axiosError = err as AxiosError<{ message?: string }>;
			showMessage({ 
				message: 'Update Failed', 
				description: axiosError.response?.data?.message || 'Failed to update setting', 
				type: 'danger' 
			});
		},
		onSuccess: (data) => {
			showMessage({ 
				message: data.autoSync ? 'Auto-sync enabled' : 'Auto-sync disabled', 
				type: 'success' 
			});
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['allCloudStatus'] });
		},
	});

	// --- Handlers ---
	const handleConnect = useCallback(async (provider: 'google' | 'onedrive' | 'dropbox') => {
		if (anyConnected) {
			showMessage({
				message: 'Limit Reached',
				description: 'Please disconnect the current provider before connecting a new one.',
				type: 'warning',
			});
			return;
		}

		setConnectingProvider(provider);
		try {
			let response;
			if (provider === 'google') response = await connectDrive();
			else if (provider === 'onedrive') response = await connectOneDrive();
			else response = await connectDropbox();

			if (response.authUrl) {
				const isSupported = await Linking.canOpenURL(response.authUrl);
				if (isSupported) {
					await Linking.openURL(response.authUrl);
				} else {
					showMessage({
						message: 'OAuth Error',
						description: 'Could not open authorization URL in system browser.',
						type: 'danger'
					});
				}
			}
		} catch (error: unknown) {
			const axiosError = error as AxiosError<{ message?: string }>;
			if (axiosError.response?.status === 403) {
				showMessage({
					message: 'Access Denied',
					description: 'Cloud sync is only available for paid plans.',
					type: 'danger'
				});
			} else {
				showMessage({
					message: 'Error',
					description: `Failed to initiate ${provider} connection.`,
					type: 'danger'
				});
			}
		} finally {
			setConnectingProvider(null);
		}
	}, [anyConnected]);

	const handleDisconnect = useCallback((provider: 'google' | 'onedrive' | 'dropbox') => {
		const name = provider === 'google' ? 'Google Drive' : provider === 'onedrive' ? 'OneDrive' : 'Dropbox';
		showAlert({
			title: 'Disconnect Cloud Sync',
			message: `Are you sure you want to disconnect ${name}? Your auto-sync configurations will be removed.`,
			type: 'confirm',
			isDestructive: true,
			confirmText: 'Disconnect',
			onConfirm: () => {
				if (provider === 'google') disconnectGoogle.mutate();
				else if (provider === 'onedrive') disconnectOneDriveMut.mutate();
				else disconnectDropboxMut.mutate();
			}
		});
	}, [showAlert, disconnectGoogle, disconnectOneDriveMut, disconnectDropboxMut]);

	const handleToggleAutoSync = useCallback((provider: 'google' | 'onedrive' | 'dropbox', enabled: boolean) => {
		if (provider === 'google') toggleGoogleAuto.mutate(enabled);
		else if (provider === 'onedrive') toggleOneDriveAuto.mutate(enabled);
		else toggleDropboxAuto.mutate(enabled);
	}, [toggleGoogleAuto, toggleOneDriveAuto, toggleDropboxAuto]);

	const handleGoBack = useCallback(() => {
		navigation.goBack();
	}, [navigation]);

	const handleRetry = useCallback(() => {
		refetch();
	}, [refetch]);

	const handleUpgrade = useCallback(() => {
		Linking.openURL('https://uploaddoc.app/pricing');
	}, []);

	// --- Render Content ---
	if (isLoading) {
		return (
			<View className="flex-1 bg-background items-center justify-center">
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	if (isError) {
		return (
			<ScrollView 
				className="flex-1 bg-background"
				contentContainerStyle={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 60 }}
			>
				<View className="px-6 pb-6">
					<ScalePressable 
						onPress={handleGoBack}
						className="w-10 h-10 rounded-full items-center justify-center border border-border/40 bg-card/50 mb-6">
						<ChevronLeft size={20} color={colors.foreground} />
					</ScalePressable>
					
					<View className="items-center py-10 bg-card border border-border rounded-[24px] p-6 shadow-sm">
						<View className="w-16 h-16 rounded-full bg-destructive/10 items-center justify-center mb-4">
							<CloudOff size={32} color={colors.destructive} />
						</View>
						<TextComponent className="font-bold text-lg text-foreground mt-2 mb-2">
							Failed to Load Settings
						</TextComponent>
						<TextComponent className="text-sm text-muted-foreground text-center mb-6 max-w-xs font-medium">
							Unable to retrieve cloud storage connection details. Please check your network.
						</TextComponent>
						
						<ScalePressable 
							onPress={handleRetry}
							style={{ overflow: 'hidden', borderRadius: 12 }}>
							<LinearGradient
								colors={[colors.primary, colors.accent]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={{ paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
								<RefreshCw size={16} color="#FFFFFF" />
								<TextComponent className="font-bold text-white text-sm ml-2">
									Retry Loading
								</TextComponent>
							</LinearGradient>
						</ScalePressable>
					</View>
				</View>
			</ScrollView>
		);
	}

	// Upgrade state check: Standard is required to use sync
	if (!eligibility.canUseDriveSync) {
		return (
			<ScrollView 
				className="flex-1 bg-background" 
				contentContainerStyle={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 60 }}
			>
				<View className="px-6 pb-6">
					<ScalePressable 
						onPress={handleGoBack}
						className="w-10 h-10 rounded-full items-center justify-center border border-border/40 bg-card/50 mb-6">
						<ChevronLeft size={20} color={colors.foreground} />
					</ScalePressable>
					
					<LinearGradient
						colors={['#1e1b4b', '#311042']} // Deep indigo/purple gradient
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						className="border border-border/30 rounded-[32px] p-6 py-10 shadow-lg relative overflow-hidden items-center">
						
						{/* Ambient Glows */}
						<View className="absolute -top-16 -left-16 w-36 h-36 rounded-full bg-primary/25 blur-xl" />
						<View className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-accent/25 blur-xl" />

						<View className="w-16 h-16 rounded-3xl bg-amber-500/10 items-center justify-center mb-6 border border-amber-500/20">
							<Crown size={32} color="#fbbf24" />
						</View>
						
						<TextComponent className="font-black text-2xl text-white mb-2 text-center">
							Upgrade to Unlock
						</TextComponent>
						
						<TextComponent className="text-sm text-white/70 text-center max-w-sm mb-8 font-medium leading-5">
							Automatically back up received documents to your personal Google Drive, Dropbox, or OneDrive cloud storage.
						</TextComponent>

						{/* Benefits List */}
						<View className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
							<View className="flex-row items-center">
								<CheckCircle2 size={16} color="#10b981" />
								<TextComponent className="text-xs text-white/95 font-bold ml-2">
									Automatic background document syncing
								</TextComponent>
							</View>
							<View className="flex-row items-center mt-2.5">
								<CheckCircle2 size={16} color="#10b981" />
								<TextComponent className="text-xs text-white/95 font-bold ml-2">
									Connect Drive, Dropbox, or OneDrive
								</TextComponent>
							</View>
							<View className="flex-row items-center mt-2.5">
								<CheckCircle2 size={16} color="#10b981" />
								<TextComponent className="text-xs text-white/95 font-bold ml-2">
									Up to unlimited sync operations daily
								</TextComponent>
							</View>
						</View>

						<ScalePressable 
							onPress={handleUpgrade}
							style={{ overflow: 'hidden', borderRadius: 16 }}>
							<LinearGradient
								colors={['#fbbf24', '#ea580c']}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={{ paddingHorizontal: 32, paddingVertical: 14, flexDirection: 'row', alignItems: 'center' }}>
								<Crown size={16} color="#FFFFFF" />
								<TextComponent className="font-black text-white text-sm ml-2">
									Upgrade Plan
								</TextComponent>
							</LinearGradient>
						</ScalePressable>
					</LinearGradient>
				</View>
			</ScrollView>
		);
	}

	const statusPayload = cloudData ? (cloudData.google || cloudData.onedrive || cloudData.dropbox) : undefined;

	return (
		<View className="flex-1 bg-background">
			{/* Ambient background glow at top */}
			<View className="absolute top-0 left-0 right-0 h-64 overflow-hidden" pointerEvents="none">
				<LinearGradient
					colors={[colors.primary + '12', 'transparent']}
					className="w-full h-full"
				/>
			</View>

			<ScrollView 
				className="flex-1" 
				contentContainerStyle={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 60 }} 
				showsVerticalScrollIndicator={false}
			>
				<View className="px-6 pb-6">
					{/* Top Navigation */}
					<View className="flex-row items-center justify-between mb-6">
						<ScalePressable 
							onPress={handleGoBack}
							className="w-10 h-10 rounded-full items-center justify-center border border-border/40 bg-card/50">
							<ChevronLeft size={20} color={colors.foreground} />
						</ScalePressable>
						{anyConnected ? (
							<View className="flex-row items-center bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
								<View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
								<TextComponent className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
									Sync Active
								</TextComponent>
							</View>
						) : null}
					</View>

					{/* Title Header */}
					<View className="mb-6">
						<TextComponent className="text-3xl font-black text-foreground mb-2 tracking-tight">
							Cloud Storage
						</TextComponent>
						<TextComponent className="text-sm text-muted-foreground font-semibold leading-5" style={{ opacity: 0.7 }}>
							Connect one cloud storage provider to sync your received documents automatically.
						</TextComponent>
					</View>

					{anyConnected ? (
						<View className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-2xl flex-row items-center mb-6 shadow-sm shadow-amber-500/5">
							<View className="w-8 h-8 rounded-xl bg-amber-500/10 items-center justify-center">
								<AlertCircle size={16} color="#d97706" />
							</View>
							<TextComponent className="text-xs text-amber-800 dark:text-amber-300/90 font-medium ml-3 flex-1 leading-4">
								Only one cloud storage provider can be connected at a time. Disconnect your current provider to switch.
							</TextComponent>
						</View>
					) : null}

					{/* Provider list */}
					<View className="mb-6">
						{/* Google Drive */}
						<ProviderCard
							id="google"
							name="Google Drive"
							brandColor="#34a853"
							gradientColors={['rgba(52, 168, 83, 0.08)', 'rgba(52, 168, 83, 0.02)']}
							logoComponent={<GoogleDriveLogo size={24} />}
							statusData={cloudData?.google}
							anyConnected={anyConnected}
							isConnecting={connectingProvider === 'google'}
							isPendingDisconnect={disconnectGoogle.isPending}
							isPendingAutoSync={toggleGoogleAuto.isPending}
							colors={colors}
							onConnect={handleConnect}
							onDisconnect={handleDisconnect}
							onToggleAutoSync={handleToggleAutoSync}
						/>

						{/* OneDrive */}
						<ProviderCard
							id="onedrive"
							name="OneDrive"
							brandColor="#0078d4"
							gradientColors={['rgba(0, 120, 212, 0.08)', 'rgba(0, 120, 212, 0.02)']}
							logoComponent={<OneDriveLogo size={24} />}
							statusData={cloudData?.onedrive}
							anyConnected={anyConnected}
							isConnecting={connectingProvider === 'onedrive'}
							isPendingDisconnect={disconnectOneDriveMut.isPending}
							isPendingAutoSync={toggleOneDriveAuto.isPending}
							colors={colors}
							onConnect={handleConnect}
							onDisconnect={handleDisconnect}
							onToggleAutoSync={handleToggleAutoSync}
						/>

						{/* Dropbox */}
						<ProviderCard
							id="dropbox"
							name="Dropbox"
							brandColor="#0061ff"
							gradientColors={['rgba(0, 97, 255, 0.08)', 'rgba(0, 97, 255, 0.02)']}
							logoComponent={<DropboxLogo size={24} />}
							statusData={cloudData?.dropbox}
							anyConnected={anyConnected}
							isConnecting={connectingProvider === 'dropbox'}
							isPendingDisconnect={disconnectDropboxMut.isPending}
							isPendingAutoSync={toggleDropboxAuto.isPending}
							colors={colors}
							onConnect={handleConnect}
							onDisconnect={handleDisconnect}
							onToggleAutoSync={handleToggleAutoSync}
						/>
					</View>

					{/* Usage Summary Section */}
					{anyConnected && statusPayload ? (
						<UsageCard
							colors={colors}
							colorScheme={colorScheme}
							statusPayload={statusPayload}
						/>
					) : null}
				</View>
			</ScrollView>
		</View>
	);
}

export default memo(CloudSyncScreen);
