import React, { memo, useCallback } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { VendorsStackParamList, MainTabParamList, Admin } from '../../types/navigation.types';
import { fetchAdminById } from '../../api/admins';
import { useTheme } from '../../providers/ThemeProvider';
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
	const { colors } = useTheme();

	// Fetch vendor details from the API using TanStack Query
	const { data: response, isLoading, error, refetch } = useQuery({
		queryKey: ['vendorDetails', vendorId],
		queryFn: () => fetchAdminById(vendorId),
	});

	const vendor = response?.data;

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
		<ScrollView
			className="flex-1 bg-background"
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ paddingBottom: 40 }}>
			
			{/* Banner / Back button */}
			<View className="px-6 pt-12 pb-4">
				<Pressable
					className="min-h-[44px] min-w-[44px] flex-row items-center"
					onPress={handleGoBack}>
					{/* Custom SVG Back Arrow */}
					<View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-muted">
						<TextComponent className="text-foreground font-bold">←</TextComponent>
					</View>
					<TextComponent className="text-foreground font-semibold text-base">
						Vendors
					</TextComponent>
				</Pressable>
			</View>

			{/* Vendor Profile Header */}
			<View className="items-center px-6 mb-6">
				{vendor.profilePicture ? (
					<Image
						source={{ uri: vendor.profilePicture }}
						className="h-24 w-24 rounded-full border-2 border-primary mb-4"
					/>
				) : (
					<View className="h-24 w-24 rounded-full bg-primary/10 items-center justify-center border-2 border-primary/20 mb-4">
						<TextComponent className="text-3xl font-bold text-primary">
							{vendor.name.charAt(0).toUpperCase()}
						</TextComponent>
					</View>
				)}
				<TextComponent className="text-2xl font-black text-foreground text-center">
					{vendor.name}
				</TextComponent>
				<TextComponent className="text-sm text-muted-foreground mt-1 text-center">
					{vendor.email}
				</TextComponent>
				{vendor.adminStatus ? (
					<View className="mt-3 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
						<TextComponent className="text-xs font-bold text-green-600 uppercase tracking-[1px]">
							{vendor.adminStatus}
						</TextComponent>
					</View>
				) : null}
			</View>

			{/* Stats Grid */}
			<View className="flex-row gap-3 px-6 mb-6">
				<View className="flex-1 rounded-[22px] border border-border bg-card p-4 items-center">
					<StarIcon size={20} color="#eab308" />
					<TextComponent className="text-sm font-black text-foreground mt-2">
						{vendor.rating ? vendor.rating.toFixed(1) : 'N/A'}
					</TextComponent>
					<TextComponent className="text-[10px] uppercase font-bold tracking-[0.5px] text-muted-foreground mt-1">
						{vendor.reviews?.length || 0} reviews
					</TextComponent>
				</View>

				<View className="flex-1 rounded-[22px] border border-border bg-card p-4 items-center">
					<View className="h-5 items-center justify-center">
						<TextComponent className="text-sm font-bold text-primary">₦</TextComponent>
					</View>
					<TextComponent className="text-sm font-black text-foreground mt-2">
						{vendor.printingCost ? `₦${vendor.printingCost}` : 'N/A'}
					</TextComponent>
					<TextComponent className="text-[10px] uppercase font-bold tracking-[0.5px] text-muted-foreground mt-1">
						Per Page
					</TextComponent>
				</View>

				<View className="flex-1 rounded-[22px] border border-border bg-card p-4 items-center">
					<ClockIcon size={20} color={colors.primary} />
					<TextComponent className="text-sm font-black text-foreground mt-2">
						{vendor.queueTimeEstimate !== undefined ? `${vendor.queueTimeEstimate}m` : 'N/A'}
					</TextComponent>
					<TextComponent className="text-[10px] uppercase font-bold tracking-[0.5px] text-muted-foreground mt-1">
						Est. Queue
					</TextComponent>
				</View>
			</View>

			{/* Information Section */}
			<View className="px-6 mb-6">
				<View className="rounded-[28px] border border-border bg-card p-5">
					<TextComponent className="text-base font-extrabold text-foreground mb-4">
						Information & Support
					</TextComponent>

					{vendor.printingLocation ? (
						<View className="flex-row items-start mb-4">
							<MapPinIcon size={18} color={colors.mutedForeground} />
							<View className="ml-3 flex-1">
								<TextComponent className="text-xs font-bold uppercase tracking-[0.5px] text-muted-foreground">
									Location
								</TextComponent>
								<TextComponent className="text-sm font-semibold text-foreground mt-0.5">
									{vendor.printingLocation}
								</TextComponent>
							</View>
						</View>
					) : null}

					{vendor.openingHours ? (
						<View className="flex-row items-start mb-4">
							<ClockIcon size={18} color={colors.mutedForeground} />
							<View className="ml-3 flex-1">
								<TextComponent className="text-xs font-bold uppercase tracking-[0.5px] text-muted-foreground">
									Hours
								</TextComponent>
								<TextComponent className="text-sm font-semibold text-foreground mt-0.5">
									{vendor.openingHours}
								</TextComponent>
							</View>
						</View>
					) : null}

					{vendor.supportContact ? (
						<View className="flex-row items-start">
							<PhoneIcon size={18} color={colors.mutedForeground} />
							<View className="ml-3 flex-1">
								<TextComponent className="text-xs font-bold uppercase tracking-[0.5px] text-muted-foreground">
									Support Contact
								</TextComponent>
								<TextComponent className="text-sm font-semibold text-foreground mt-0.5">
									{vendor.supportContact}
								</TextComponent>
							</View>
						</View>
					) : null}

					{vendor.additionalInfo ? (
						<View className="mt-4 pt-4 border-t border-border/60">
							<TextComponent className="text-xs font-bold uppercase tracking-[0.5px] text-muted-foreground mb-1">
								About Print Provider
							</TextComponent>
							<TextComponent className="text-sm leading-6 text-foreground font-medium">
								{vendor.additionalInfo}
							</TextComponent>
						</View>
					) : null}
				</View>
			</View>

			{/* Discount Tiers */}
			{vendor.discountRates && vendor.discountRates.length > 0 ? (
				<View className="px-6 mb-6">
					<View className="rounded-[28px] border border-border bg-card p-5">
						<TextComponent className="text-base font-extrabold text-foreground mb-3">
							Bulk Print Discounts
						</TextComponent>
						<TextComponent className="text-xs text-muted-foreground mb-4">
							Get discounted pricing based on the total number of pages in your print request.
						</TextComponent>
						{vendor.discountRates.map((rate) => (
							<View
								key={rate._id}
								className="flex-row items-center justify-between py-2 border-b border-border/40 last:border-b-0">
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

			{/* Reviews Section */}
			{vendor.reviews && vendor.reviews.length > 0 ? (
				<View className="px-6 mb-6">
					<View className="rounded-[28px] border border-border bg-card p-5">
						<TextComponent className="text-base font-extrabold text-foreground mb-4">
							Customer Reviews ({vendor.reviews.length})
						</TextComponent>
						{vendor.reviews.map((review) => (
							<View
								key={review._id}
								className="mb-4 pb-4 border-b border-border/40 last:border-b-0 last:mb-0 last:pb-0">
								<View className="flex-row items-center justify-between mb-2">
									<TextComponent className="text-sm font-bold text-foreground">
										{review.name || 'Anonymous User'}
									</TextComponent>
									<View className="flex-row items-center">
										<StarIcon size={12} color="#eab308" />
										<TextComponent className="text-xs font-bold text-foreground ml-1">
											{review.rating.toFixed(1)}
										</TextComponent>
									</View>
								</View>
								<TextComponent className="text-sm leading-6 text-muted-foreground font-medium">
									{review.comment}
								</TextComponent>
							</View>
						))}
					</View>
				</View>
			) : null}

			{/* Submit Button Floating Card */}
			<View className="px-6 mt-4">
				<Pressable
					className="min-h-[56px] flex-row items-center justify-center rounded-[22px] bg-primary active:opacity-90 shadow-lg"
					onPress={handleSubmitDocument}>
					<TextComponent className="text-lg font-black text-primary-foreground">
						Submit Document to Vendor
					</TextComponent>
				</Pressable>
			</View>

		</ScrollView>
	);
}

export default memo(VendorDetailsScreen);
