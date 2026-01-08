import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { TextComponent } from 'src/components';
import { useTheme } from 'src/providers/ThemeProvider';
import {
	StarIcon,
	MailIcon,
	MapPinIcon,
	PhoneIcon,
	ClockIcon,
	UsersIcon,
} from 'src/assets/icons';
import { Admin } from 'src/types/navigation.types';

interface VendorCardProps {
	admin: Admin;
	onSelect: (admin: Admin) => void;
}

const VendorCard: React.FC<VendorCardProps> = ({ admin, onSelect }) => {
	const { colors } = useTheme();

	return (
		<View className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm mb-4">
			<View className="p-5">
				{/* Header: Avatar, Name, Rating, Status */}
				<View className="flex-row items-start justify-between gap-3">
					<View className="flex-row items-center gap-3 flex-1">
						{/* Profile Picture */}
						<View className="relative h-14 w-14 rounded-full overflow-hidden bg-muted border-2 border-border">
							{admin.profilePicture ? (
								<Image
									source={{ uri: admin.profilePicture }}
									className="h-full w-full"
									resizeMode="cover"
								/>
							) : (
								<View className="h-full w-full flex items-center justify-center bg-muted">
									<UsersIcon
										size={28}
										color={colors.mutedForeground}
									/>
								</View>
							)}
						</View>
						{/* Name + Rating */}
						<View className="flex-1">
							<TextComponent
								className="font-bold text-base text-foreground"
								numberOfLines={1}>
								{admin.name}
							</TextComponent>
							{/* <View className="flex-row items-center gap-2 mt-1">
								<View className="flex-row items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full">
									<StarIcon
										size={12}
										color="#eab308"
									/>
									<TextComponent className="text-xs font-semibold text-yellow-700 dark:text-yellow-500 ml-1">
										{admin.rating ? admin.rating.toFixed(1) : 'New'}
									</TextComponent>
								</View>
								<TextComponent className="text-xs text-muted-foreground">
									• {admin.reviews?.length || 0} reviews
								</TextComponent>
							</View> */}
						</View>
					</View>
					{/* Status Badge */}
					<View
						className={`px-2.5 py-1 rounded-full border ${
							admin.adminStatus === 'active'
								? 'dark:bg-green-900/20 border-green-200 dark:border-green-900/30'
								: 'dark:bg-muted border-border'
						}`}>
						<TextComponent
							className={`text-xs font-medium ${
								admin.adminStatus === 'active'
									? 'text-green-700 dark:text-green-400'
									: 'text-muted-foreground'
							}`}>
							{admin.adminStatus === 'active' ? 'Active' : 'Offline'}
						</TextComponent>
					</View>
				</View>

				{/* Info Rows */}
				<View className="mt-5 space-y-2.5">
					{admin.email && (
						<View className="flex-row items-center">
							<View className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center mr-3">
								<MailIcon
									size={14}
									color={colors.mutedForeground}
								/>
							</View>
							<TextComponent
								className="text-sm text-muted-foreground flex-1"
								numberOfLines={1}>
								{admin.email}
							</TextComponent>
						</View>
					)}

					{admin.printingLocation && (
						<View className="flex-row items-center">
							<View className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center mr-3">
								<MapPinIcon
									size={14}
									color={colors.mutedForeground}
								/>
							</View>
							<TextComponent
								className="text-sm text-muted-foreground flex-1"
								numberOfLines={1}>
								{admin.printingLocation}
							</TextComponent>
						</View>
					)}

					{admin.supportContact && (
						<View className="flex-row items-center">
							<View className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center mr-3">
								<PhoneIcon
									size={14}
									color={colors.mutedForeground}
								/>
							</View>
							<TextComponent className="text-sm text-muted-foreground">
								{admin.supportContact}
							</TextComponent>
						</View>
					)}

					{admin.openingHours && (
						<View className="flex-row items-center">
							<View className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center mr-3">
								<ClockIcon
									size={14}
									color={colors.mutedForeground}
								/>
							</View>
							<TextComponent className="text-sm text-muted-foreground">
								{admin.openingHours}
							</TextComponent>
						</View>
					)}
				</View>
			</View>

			{/* Footer: Rate + Select Button */}
			<View className="px-5 py-4 bg-background border-t border-border flex-row items-center justify-between">
				{!!admin.printingCost && (
					<View>
						<TextComponent className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
							Rate
						</TextComponent>
						<View className="flex-row items-baseline">
							<TextComponent className="font-bold text-foreground text-lg">
								{admin.printingCost ? `₦${admin.printingCost}` : 'N/A'}
							</TextComponent>
							{admin.printingCost && (
								<TextComponent className="text-xs text-muted-foreground ml-1">
									/page
								</TextComponent>
							)}
						</View>
					</View>
				)}
				<Pressable
					onPress={() => onSelect(admin)}
					className="bg-primary px-5 py-2.5 rounded-md font-normal active:opacity-90"
					style={({ pressed }) => ({
						opacity: pressed ? 0.9 : 1,
					})}>
					<TextComponent className="text-white font-normal text-sm">
						Select Vendor
					</TextComponent>
				</Pressable>
			</View>
		</View>
	);
};

export default React.memo(VendorCard);
