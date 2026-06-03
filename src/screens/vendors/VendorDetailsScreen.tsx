import React, { memo, useCallback } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { VendorsStackParamList, MainTabParamList, Admin } from '../../types/navigation.types';
import { fetchAdminById } from '../../api/admins';
import { useTheme } from '../../providers/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextComponent from '../../components/ui/TextComponent';
import {
	StarIcon,
	MapPinIcon,
	PhoneIcon,
	ClockIcon,
	MailIcon,
	AlertCircleIcon,
} from '../../assets/icons';

type NavigationProp = CompositeNavigationProp<
	NativeStackScreenProps<VendorsStackParamList, 'VendorDetails'>['navigation'],
	BottomTabNavigationProp<MainTabParamList>
>;

type Props = {
	navigation: NavigationProp;
	route: NativeStackScreenProps<VendorsStackParamList, 'VendorDetails'>['route'];
};

const SkeletonLoader = memo(function SkeletonLoader() {
	return (
		<ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 24 }}>
			{/* Back Button Skeleton */}
			<View className="h-6 w-20 bg-muted rounded-md mb-8 animate-pulse" />
			
			{/* Header Skeleton */}
			<View className="items-center mb-8 animate-pulse">
				<View className="h-24 w-24 bg-muted rounded-full mb-4" />
				<View className="h-7 w-48 bg-muted rounded-md mb-2" />
				<View className="h-4 w-36 bg-muted rounded-md" />
			</View>

			{/* Stats Grid Skeleton */}
			<View className="flex-row gap-3 mb-6 animate-pulse">
				<View className="flex-1 h-20 bg-muted rounded-2xl" />
				<View className="flex-1 h-20 bg-muted rounded-2xl" />
				<View className="flex-1 h-20 bg-muted rounded-2xl" />
			</View>

			{/* Block Skeleton */}
			<View className="h-40 bg-muted rounded-3xl mb-6 animate-pulse" />
			<View className="h-32 bg-muted rounded-3xl animate-pulse" />
		</ScrollView>
	);
});

function VendorDetailsScreen({ navigation, route }: Props) {
	const { vendorId } = route.params;
	const { colors, colorScheme } = useTheme();
	const insets = useSafeAreaInsets();

	const tabBarHeight = 64;
	const tabBarBottom = insets.bottom > 0 ? insets.bottom + 8 : 16;
	const bottomSpacer = tabBarHeight + tabBarBottom + 12;
	const scrollViewPaddingBottom = bottomSpacer + 84;

	// Fetch vendor details from the API using TanStack Query
	const { data: response, isLoading, error, refetch } = useQuery({
		queryKey: ['vendorDetails', vendorId],
		queryFn: () => fetchAdminById(vendorId),
	});

	const vendor = response;

	const handleGoBack = useCallback(() => {
		navigation.goBack();
	}, [navigation]);

	const handleSubmitDocument = useCallback(() => {
		if (!vendor) return;
		// Navigate to Documents tab and open SubmitDocument screen with vendor pre-filled
		navigation.navigate('DocumentsTab', {
			screen: 'SubmitDocument',
			params: {
				vendorId: vendor._id,
				vendorName: vendor.name,
				vendorEmail: vendor.email,
				vendorProfilePicture: vendor.profilePicture || undefined,
				vendorPrintingCost: vendor.printingCost || undefined,
				vendorRating: vendor.rating,
				isVendorLocked: true,
			},
		});
	}, [navigation, vendor]);

	if (isLoading) {
		return <SkeletonLoader />;
	}

	if (error || !vendor) {
		return (
			<View className="flex-1 bg-background items-center justify-center p-6">
				<AlertCircleIcon size={48} color={colors.destructive} />
				<TextComponent className="text-lg font-bold text-foreground mt-4 text-center">
					Failed to load vendor details
				</TextComponent>
				<TextComponent className="text-sm text-muted-foreground mt-2 text-center mb-6">
					{error instanceof Error ? error.message : 'An unexpected error occurred.'}
				</TextComponent>
				<Pressable
					onPress={() => refetch()}
					className="min-h-[48px] px-6 bg-primary rounded-full items-center justify-center">
					<TextComponent className="text-primary-foreground font-bold">
						Retry
					</TextComponent>
				</Pressable>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ 
					paddingTop: insets.top + 8,
					paddingBottom: scrollViewPaddingBottom 
				}}>
				
				{/* Top Header: Back Button */}
				<View className="px-5 pb-4 flex-row items-center">
					<Pressable
						className="flex-row items-center active:opacity-70 py-2 pr-4"
						onPress={handleGoBack}>
						<View className="h-8 w-8 items-center justify-center rounded-full bg-card border border-border mr-2.5">
							<TextComponent className="text-foreground font-bold text-sm">←</TextComponent>
						</View>
						<TextComponent className="text-foreground font-bold text-base">
							Vendors
						</TextComponent>
					</Pressable>
				</View>

				{/* Vendor Profile Header */}
				<View className="items-center px-5 mb-6">
					{vendor.profilePicture ? (
						<Image
							source={{ uri: vendor.profilePicture }}
							className="h-24 w-24 rounded-full border-2 border mb-4"
						/>
					) : (
						<View className="h-24 w-24 rounded-full bg-primary/10 items-center justify-center border-2 border mb-4">
							<TextComponent className="text-3xl font-black text-primary">
								{vendor.name.charAt(0).toUpperCase()}
							</TextComponent>
						</View>
					)}
					<TextComponent className="text-2xl font-black text-foreground text-center">
						{vendor.name}
					</TextComponent>
					<TextComponent 
						className="text-sm font-semibold text-foreground mt-1 text-center"
						style={{ opacity: 0.6 }}>
						{vendor.email}
					</TextComponent>
					
					{/* Status badge */}
					<View 
						className="mt-3.5 px-3 py-1 rounded-full border"
						style={{ 
							backgroundColor: vendor.adminStatus === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
							borderColor: vendor.adminStatus === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)'
						}}>
						<TextComponent 
							className="text-[10px] font-extrabold uppercase tracking-[0.8px]"
							style={{ color: vendor.adminStatus === 'active' ? (colorScheme === 'dark' ? '#86efac' : '#15803d') : colors.mutedForeground }}>
							{vendor.adminStatus === 'active' ? 'Online' : 'Offline'}
						</TextComponent>
					</View>
				</View>

				{/* Stats Grid Card Rows */}
				<View className="flex-row gap-3 px-5 mb-6">
					<View className="flex-1 rounded-[22px] border border-border bg-card p-4 items-center shadow-sm">
						<StarIcon size={18} color="#eab308" />
						<TextComponent className="text-sm font-black text-foreground mt-2">
							{vendor.rating ? vendor.rating.toFixed(1) : 'N/A'}
						</TextComponent>
						<TextComponent 
							className="text-[9px] uppercase font-bold tracking-[0.5px] text-foreground mt-1"
							style={{ opacity: 0.45 }}>
							{vendor.reviews?.length || 0} reviews
						</TextComponent>
					</View>

					<View className="flex-1 rounded-[22px] border border-border bg-card p-4 items-center shadow-sm">
						<View className="h-4.5 items-center justify-center">
							<TextComponent className="text-sm font-black text-primary">₦</TextComponent>
						</View>
						<TextComponent className="text-sm font-black text-foreground mt-2">
							{vendor.printingCost ? `₦${vendor.printingCost}` : 'N/A'}
						</TextComponent>
						<TextComponent 
							className="text-[9px] uppercase font-bold tracking-[0.5px] text-foreground mt-1"
							style={{ opacity: 0.45 }}>
							Per Page
						</TextComponent>
					</View>

					<View className="flex-1 rounded-[22px] border border-border bg-card p-4 items-center shadow-sm">
						<ClockIcon size={18} color={colors.primary} />
						<TextComponent className="text-sm font-black text-foreground mt-2">
							{vendor.queueTimeEstimate !== undefined ? `${vendor.queueTimeEstimate}m` : 'N/A'}
						</TextComponent>
						<TextComponent 
							className="text-[9px] uppercase font-bold tracking-[0.5px] text-foreground mt-1"
							style={{ opacity: 0.45 }}>
							Est. Queue
						</TextComponent>
					</View>
				</View>

				{/* Information Details Card */}
				<View className="px-5 mb-6">
					<View className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
						<TextComponent className="text-base font-extrabold text-foreground mb-4">
							Information & Support
						</TextComponent>

						{vendor.printingLocation ? (
							<View className="flex-row items-center mb-4">
								<View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border">
									<MapPinIcon size={14} color={colors.primary} />
								</View>
								<View className="flex-1">
									<TextComponent 
										className="text-[9px] font-bold uppercase tracking-[0.5px] text-foreground"
										style={{ opacity: 0.45 }}>
										Location
									</TextComponent>
									<TextComponent className="text-sm font-bold text-foreground mt-0.5" numberOfLines={1}>
										{vendor.printingLocation}
									</TextComponent>
								</View>
							</View>
						) : null}

						{vendor.openingHours ? (
							<View className="flex-row items-center mb-4">
								<View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border">
									<ClockIcon size={14} color={colors.primary} />
								</View>
								<View className="flex-1">
									<TextComponent 
										className="text-[9px] font-bold uppercase tracking-[0.5px] text-foreground"
										style={{ opacity: 0.45 }}>
										Hours
									</TextComponent>
									<TextComponent className="text-sm font-bold text-foreground mt-0.5" numberOfLines={1}>
										{vendor.openingHours}
									</TextComponent>
								</View>
							</View>
						) : null}

						{vendor.supportContact ? (
							<View className="flex-row items-center">
								<View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border">
									<PhoneIcon size={14} color={colors.primary} />
								</View>
								<View className="flex-1">
									<TextComponent 
										className="text-[9px] font-bold uppercase tracking-[0.5px] text-foreground"
										style={{ opacity: 0.45 }}>
										Support Contact
									</TextComponent>
									<TextComponent className="text-sm font-bold text-foreground mt-0.5" numberOfLines={1}>
										{vendor.supportContact}
									</TextComponent>
								</View>
							</View>
						) : null}

						{vendor.additionalInfo ? (
							<View className="mt-4 pt-4 border-t border-border">
								<TextComponent 
									className="text-[9px] font-bold uppercase tracking-[0.5px] text-foreground mb-1.5"
									style={{ opacity: 0.45 }}>
									About Vendor
								</TextComponent>
								<TextComponent 
									className="text-xs leading-5 text-foreground font-medium"
									style={{ opacity: 0.7 }}>
									{vendor.additionalInfo}
								</TextComponent>
							</View>
						) : null}
					</View>
				</View>

				{/* Bulk Print Discount Rates */}
				{vendor.discountRates && vendor.discountRates.length > 0 ? (
					<View className="px-5 mb-6">
						<View className="rounded-[24px] border border-border bg-card p-5 shadow-sm">
							<TextComponent className="text-base font-extrabold text-foreground mb-2">
								Bulk Print Discounts
							</TextComponent>
							<TextComponent 
								className="text-xs text-foreground mb-4 font-semibold"
								style={{ opacity: 0.6 }}>
								Get discounted pricing based on the total number of pages in your print request.
							</TextComponent>
							{vendor.discountRates.map((rate) => (
								<View
									key={rate._id}
									className="flex-row items-center justify-between py-3 border-b border-border last:border-b-0">
									<TextComponent className="text-sm font-bold text-foreground">
										{rate.maxPages
											? `${rate.minPages} - ${rate.maxPages} pages`
											: `${rate.minPages}+ pages`}
									</TextComponent>
									<View className="px-3 py-1 rounded-full bg-primary/10">
										<TextComponent className="text-xs font-black text-primary">
											{rate.discount}% Off
										</TextComponent>
									</View>
								</View>
							))}
						</View>
					</View>
				) : null}

			
			</ScrollView>

			{/* Floating / Sticky bottom button capsule */}
			<View 
				className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-5 pt-4"
				style={{ paddingBottom: bottomSpacer }}>
				<Pressable
					className="min-h-[52px] flex-row items-center justify-center rounded-2xl bg-primary active:opacity-90 shadow-lg px-4"
					style={({ pressed }) => ({
						transform: [{ scale: pressed ? 0.98 : 1 }],
					})}
					onPress={handleSubmitDocument}>
					<TextComponent 
						className="text-base font-extrabold text-primary-foreground text-center"
						numberOfLines={1}
						ellipsizeMode="tail">
						Submit to {vendor.name}
					</TextComponent>
				</Pressable>
			</View>
		</View>
	);
}

export default memo(VendorDetailsScreen);
