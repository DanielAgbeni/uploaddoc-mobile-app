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
		<View className="bg-card border border-border rounded-3xl overflow-hidden shadow-md mb-5 mx-1">
			<View className="p-5">
				{/* Header: Avatar, Name, Status */}
				<View className="flex-row items-center gap-4">
					{/* Profile Picture */}
					<View className="relative h-16 w-16 rounded-full overflow-hidden bg-muted border-2 border-border shadow-sm">
						{admin.profilePicture ? (
							<Image
								source={{ uri: admin.profilePicture }}
								className="h-full w-full"
								resizeMode="cover"
							/>
						) : (
							<View className="h-full w-full flex items-center justify-center bg-muted/50">
								<UsersIcon
									size={32}
									color={colors.mutedForeground}
								/>
							</View>
						)}
						{/* Status Indicator Dot - Optional Absolute Positioned */}
						<View
							className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card ${
								admin.adminStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'
							}`}
						/>
					</View>

					{/* Name & Basic Meta */}
					<View className="flex-1 justify-center">
						<View className="flex-row justify-between items-start">
							<View className="flex-1 mr-2">
								<TextComponent
									className="font-bold text-lg text-foreground mb-1"
									numberOfLines={1}>
									{admin.name}
								</TextComponent>
								{/* Status Text Badge */}
								<View className="flex-row items-center">
									<View
										className={`px-2 py-0.5 rounded-md ${
											admin.adminStatus === 'active'
												? 'bg-green-100 dark:bg-green-900/30'
												: 'bg-muted'
										}`}>
										<TextComponent
											className={`text-[10px] font-bold uppercase tracking-wide ${
												admin.adminStatus === 'active'
													? 'text-green-700 dark:text-green-400'
													: 'text-muted-foreground'
											}`}>
											{admin.adminStatus === 'active' ? 'Available' : 'Offline'}
										</TextComponent>
									</View>
								</View>
							</View>
						</View>
					</View>
				</View>

				{/* Divider */}
				<View className="h-[1px] bg-border my-4" />

				{/* Info Rows - Compact & Aligned */}
				<View className="space-y-3">
					{admin.email && (
						<View className="flex-row items-center">
							<View className="w-6 items-center justify-center mr-3">
								<MailIcon
									size={16}
									color={colors.primary}
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
						<View className="flex-row items-start">
							<View className="w-6 items-center justify-center mr-3 mt-0.5">
								<MapPinIcon
									size={16}
									color={colors.primary}
								/>
							</View>
							<TextComponent
								className="text-sm text-muted-foreground flex-1"
								numberOfLines={2}>
								{admin.printingLocation}
							</TextComponent>
						</View>
					)}

					{admin.supportContact && (
						<View className="flex-row items-center">
							<View className="w-6 items-center justify-center mr-3">
								<PhoneIcon
									size={16}
									color={colors.primary}
								/>
							</View>
							<TextComponent className="text-sm text-muted-foreground">
								{admin.supportContact}
							</TextComponent>
						</View>
					)}

					{/* {admin.openingHours && (
						<View className="flex-row items-center">
							<View className="w-6 items-center justify-center mr-3">
								<ClockIcon
									size={16}
									color={colors.primary}
									style={{ opacity: 0.7 }}
								/>
							</View>
							<TextComponent className="text-sm text-muted-foreground">
								{admin.openingHours}
							</TextComponent>
						</View>
					)} */}
				</View>
			</View>

			{/* Highlighted Footer Action Area */}
			<View className="bg-muted/30 px-5 py-4 flex-row items-center justify-between border-t border-border">
				<View>
					<TextComponent className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
						Rate per page(pdf)
					</TextComponent>
					<View className="flex-row items-baseline">
						<TextComponent className="font-extrabold text-foreground text-xl">
							{admin.printingCost ? `₦${admin.printingCost}` : 'N/A'}
						</TextComponent>
					</View>
				</View>

				<Pressable
					onPress={() => onSelect(admin)}
					className="bg-primary h-10 px-6 rounded-full flex-row items-center justify-center active:bg-primary shadow-sm"
					style={({ pressed }) => ({
						transform: [{ scale: pressed ? 0.96 : 1 }],
					})}>
					<TextComponent className="text-white font-semibold text-sm">
						Select
					</TextComponent>
				</Pressable>
			</View>
		</View>
	);
};

export default React.memo(VendorCard);
