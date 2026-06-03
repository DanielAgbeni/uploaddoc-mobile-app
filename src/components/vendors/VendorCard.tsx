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

	const statusColor = isActive
		? colorScheme === 'dark'
			? '#10b981'
			: '#059669'
		: colorScheme === 'dark'
			? '#94a3b8'
			: '#64748b';

	const statusTint = isActive
		? colorScheme === 'dark'
			? 'rgba(16, 185, 129, 0.12)'
			: '#d1fae5'
		: colorScheme === 'dark'
			? 'rgba(148, 163, 184, 0.12)'
			: '#f1f5f9';

	const verifiedColor = colorScheme === 'dark' ? '#2dd4bf' : '#0f766e';
	const verifiedTint = colorScheme === 'dark' ? 'rgba(45, 212, 191, 0.12)' : '#ccfbf1';

	return (
		<Pressable
			onPress={() => onSelect(admin)}
			className="mb-4 overflow-hidden rounded-[24px] border border-border bg-card shadow-sm relative px-5 py-5 active:opacity-95"
			style={({ pressed }) => ({
				transform: [{ scale: pressed ? 0.98 : 1 }],
			})}>
			
			{/* Top Header Row: Profile Avatar, Name, Status Badge */}
			<View className="flex-row items-start mb-4">
				{/* Avatar */}
				<View className="relative mr-3 h-12 w-12 overflow-hidden rounded-full border border-border bg-muted shadow-sm">
					{admin.profilePicture ? (
						<Image
							source={{ uri: admin.profilePicture }}
							className="h-full w-full"
							resizeMode="cover"
						/>
					) : (
						<View className="h-full w-full items-center justify-center bg-muted/50">
							<UsersIcon
								size={22}
								color={colors.mutedForeground}
							/>
						</View>
					)}
				</View>

				{/* Name & Badge */}
				<View className="flex-1 min-w-0 pr-1">
					<View className="flex-row items-center justify-between gap-2 mb-1">
						<TextComponent
							className="flex-1 text-base font-bold leading-5 text-foreground"
							numberOfLines={1}>
							{admin.name}
						</TextComponent>

						{/* Status Badge with Dot */}
						<View
							className="flex-row items-center rounded-full px-2.5 py-0.5"
							style={{ backgroundColor: statusTint }}>
							<View
								className="w-1.5 h-1.5 rounded-full mr-1.5"
								style={{ backgroundColor: statusColor }}
							/>
							<TextComponent
								className="text-[9px] font-extrabold uppercase tracking-[0.5px]"
								style={{ color: statusColor }}>
								{isActive ? 'Active' : 'Offline'}
							</TextComponent>
						</View>
					</View>

					{/* Verified Tag */}
					<View
						className="self-start rounded-full px-2 py-0.5"
						style={{ backgroundColor: verifiedTint }}>
						<View className="flex-row items-center gap-1">
							<ShieldIcon
								size={9}
								color={verifiedColor}
							/>
							<TextComponent
								className="text-[8px] font-extrabold uppercase tracking-[0.5px]"
								style={{ color: verifiedColor }}>
								Verified Provider
							</TextComponent>
						</View>
					</View>
				</View>
			</View>

			{/* Contact & Location Details */}
			<View className="gap-2 mb-4">
				{admin.printingLocation ? (
					<View className="flex-row items-center">
						<MapPinIcon
							size={13}
							color={colors.primary}
						/>
						<TextComponent
							className="flex-1 text-xs text-foreground font-medium ml-2"
							style={{ opacity: 0.65 }}
							numberOfLines={1}>
							{admin.printingLocation}
						</TextComponent>
					</View>
				) : null}

				{admin.supportContact ? (
					<View className="flex-row items-center">
						<PhoneIcon
							size={13}
							color={colors.primary}
						/>
						<TextComponent
							className="flex-1 text-xs text-foreground font-medium ml-2"
							style={{ opacity: 0.65 }}
							numberOfLines={1}>
							{admin.supportContact}
						</TextComponent>
					</View>
				) : null}

				{admin.rating ? (
					<View className="flex-row items-center">
						<StarIcon
							size={13}
							color="#eab308"
						/>
						<TextComponent 
							className="flex-1 text-xs text-foreground font-medium ml-2"
							style={{ opacity: 0.65 }}>
							{admin.rating.toFixed(1)} rating
						</TextComponent>
					</View>
				) : null}
			</View>

			{/* Footer: Pricing info and quick select visual feedback */}
			<View className="flex-row items-center justify-between border-t border-border pt-4 ml-1">
				<View>
					<TextComponent 
						className="text-[9px] font-bold uppercase tracking-[0.8px] text-foreground"
						style={{ opacity: 0.45 }}>
						Rate per page
					</TextComponent>
					<View className="flex-row items-baseline mt-0.5">
						<TextComponent className="text-lg font-black text-foreground">
							{admin.printingCost ? `₦${admin.printingCost}` : 'N/A'}
						</TextComponent>
						<TextComponent 
							className="text-[10px] text-foreground ml-1"
							style={{ opacity: 0.45 }}>
							/page
						</TextComponent>
					</View>
				</View>

				{/* Compact select button visual feedback */}
				<View className="h-8 rounded-full bg-primary/10 border border-border px-3.5 items-center justify-center">
					<TextComponent className="text-xs font-bold text-text">
						Select
					</TextComponent>
				</View>
			</View>
		</Pressable>
	);
};

export default React.memo(VendorCard);
