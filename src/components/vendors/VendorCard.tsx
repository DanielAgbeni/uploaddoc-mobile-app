import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { TextComponent } from 'src/components';
import {
	MapPinIcon,
	PhoneIcon,
	ShieldIcon,
	StarIcon,
	UsersIcon,
} from 'src/assets/icons';
import { useTheme } from 'src/providers/ThemeProvider';
import { Admin } from 'src/types/navigation.types';

interface VendorCardProps {
	admin: Admin;
	onSelect: (admin: Admin) => void;
}

const VendorCard: React.FC<VendorCardProps> = ({ admin, onSelect }) => {
	const { colorScheme, colors } = useTheme();
	const isActive = admin.adminStatus === 'active';
	const statusTint = isActive
		? colorScheme === 'dark'
			? 'rgba(52, 211, 153, 0.16)'
			: '#dcfce7'
		: colorScheme === 'dark'
			? 'rgba(148, 163, 184, 0.18)'
			: '#e2e8f0';
	const statusColor = isActive
		? colorScheme === 'dark'
			? '#86efac'
			: '#15803d'
		: colors.mutedForeground;
	const verifiedTint =
		colorScheme === 'dark' ? 'rgba(45, 212, 191, 0.14)' : '#ccfbf1';
	const verifiedColor = colorScheme === 'dark' ? '#5eead4' : '#0f766e';

	return (
		<View className="mb-4 flex-1 overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
			<View className="px-4 py-5">
				<View className="flex-row items-start">
					<View className="relative mr-4 h-16 w-16 overflow-hidden rounded-full border border-border bg-muted shadow-sm">
						{admin.profilePicture ? (
							<Image
								source={{ uri: admin.profilePicture }}
								className="h-full w-full"
								resizeMode="cover"
							/>
						) : (
							<View className="h-full w-full items-center justify-center bg-muted/50">
								<UsersIcon
									size={32}
									color={colors.mutedForeground}
								/>
							</View>
						)}
						<View
							className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card ${
								isActive ? 'bg-green-500' : 'bg-gray-400'
							}`}
						/>
					</View>

					<View className="min-w-0 flex-1">
						<View className="mb-2 flex-row items-start justify-between gap-3">
							<TextComponent
								className="min-w-0 flex-1 text-lg font-extrabold leading-6 text-foreground"
								numberOfLines={2}>
								{admin.name}
							</TextComponent>

							<View
								className="rounded-full px-3 py-1.5"
								style={{ backgroundColor: statusTint }}>
								<TextComponent
									className="text-xs font-bold"
									style={{ color: statusColor }}>
									{isActive ? 'Active' : 'Offline'}
								</TextComponent>
							</View>
						</View>

						<View
							className="mb-4 self-start rounded-full px-3 py-1"
							style={{ backgroundColor: verifiedTint }}>
							<View className="flex-row items-center gap-1.5">
								<ShieldIcon
									size={12}
									color={verifiedColor}
								/>
								<TextComponent
									className="text-[10px] font-extrabold uppercase"
									style={{ color: verifiedColor }}>
									Verified Provider
								</TextComponent>
							</View>
						</View>

						<View className="gap-3">
							{admin.printingLocation ? (
								<View className="flex-row items-start">
									<View className="mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-background">
										<MapPinIcon
											size={15}
											color={colors.primary}
										/>
									</View>
									<TextComponent
										className="flex-1 text-sm leading-5 text-muted-foreground"
										numberOfLines={2}>
										{admin.printingLocation}
									</TextComponent>
								</View>
							) : null}

							{admin.supportContact ? (
								<View className="flex-row items-center">
									<View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-background">
										<PhoneIcon
											size={15}
											color={colors.primary}
										/>
									</View>
									<TextComponent
										className="flex-1 text-sm text-muted-foreground"
										numberOfLines={1}>
										{admin.supportContact}
									</TextComponent>
								</View>
							) : null}

							{admin.rating ? (
								<View className="flex-row items-center">
									<View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-background">
										<StarIcon
											size={15}
											color="#f59e0b"
										/>
									</View>
									<TextComponent className="text-sm text-muted-foreground">
										{admin.rating.toFixed(1)} rating
									</TextComponent>
								</View>
							) : null}
						</View>
					</View>
				</View>
			</View>

			<View className="flex-row items-center justify-between border-t border-border bg-muted/30 px-5 py-4">
				<View>
					<TextComponent className="mb-0.5 text-[10px] font-bold uppercase tracking-[1.2px] text-muted-foreground">
						Rate per page
					</TextComponent>
					<View className="flex-row items-baseline">
						<TextComponent className="text-xl font-extrabold text-foreground">
							{admin.printingCost ? `₦${admin.printingCost}` : 'N/A'}
						</TextComponent>
						<TextComponent className="ml-1 text-xs text-muted-foreground">
							/page
						</TextComponent>
					</View>
				</View>

				<Pressable
					onPress={() => onSelect(admin)}
					className="h-11 flex-row items-center justify-center rounded-full bg-primary px-5 shadow-sm active:opacity-85"
					style={({ pressed }) => ({
						transform: [{ scale: pressed ? 0.96 : 1 }],
					})}>
					<TextComponent className="text-sm font-semibold text-white">
						Select Vendor
					</TextComponent>
				</Pressable>
			</View>
		</View>
	);
};

export default React.memo(VendorCard);
