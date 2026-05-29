import React, { memo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, Clock, CheckCircle } from 'lucide-react-native';
import CustomImage from '../../../components/common/CustomImage';
import NotificationBell from '../../../components/common/NotificationBell';
import TextComponent from '../../../components/ui/TextComponent';
import { useTheme } from '../../../providers/ThemeProvider';

interface DocumentsHeaderProps {
	acceptedCount: number;
	firstName: string;
	onNotificationPress: () => void;
	pendingCount: number;
	profilePicture: string | null | undefined;
	totalCount: number;
}

const DocumentsHeader = memo(function DocumentsHeader({
	acceptedCount,
	firstName,
	onNotificationPress,
	pendingCount,
	profilePicture,
	totalCount,
}: DocumentsHeaderProps) {
	const insets = useSafeAreaInsets();
	const { colors, colorScheme } = useTheme();

	return (
		<View 
			className="px-5 pb-5 border-b border-border/50 bg-background"
			style={{ paddingTop: insets.top + 16 }}>
			
			{/* Top row: Brand & Profile Avatar */}
			<View className="flex-row items-center justify-between mb-5">
				{/* Logo Mark + Brand Title */}
				<View className="flex-row items-center">
					<View className="h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mr-2.5">
						<CustomImage
							source={require('../../../assets/app-images/icon.png')}
							className="h-5 w-5 rounded-full"
							contentFit="cover"
						/>
					</View>
					<TextComponent className="text-xl font-extrabold tracking-tight text-foreground">
						UploadDoc
					</TextComponent>
				</View>

				{/* Bell + Avatar */}
				<View className="flex-row items-center gap-2.5">
					<NotificationBell onPress={onNotificationPress} />

					<View className="h-9 w-9 overflow-hidden rounded-full border border-border bg-card shadow-sm">
						<CustomImage
							source={
								profilePicture
									? { uri: profilePicture }
									: require('../../../assets/app-images/icon.png')
							}
							className="h-full w-full rounded-full"
							contentFit="cover"
						/>
					</View>
				</View>
			</View>

			{/* Welcome Message Label */}
			<View className="mb-5">
				<TextComponent className="text-xs font-bold text-muted-foreground uppercase tracking-[0.8px]">
					Welcome back,
				</TextComponent>
				<TextComponent className="text-3xl font-black text-foreground mt-0.5 leading-9">
					{firstName}
				</TextComponent>
			</View>

			{/* Row of Three Stats Cards */}
			<View className="flex-row gap-3">
				{/* Total Stat Card */}
				<View className="flex-1 rounded-[22px] border border-border bg-card p-3.5 shadow-sm">
					<View className="flex-row items-center justify-between mb-2">
						<TextComponent className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
							Total
						</TextComponent>
						<View className="h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
							<FileText
								size={13}
								color={colors.primary}
							/>
						</View>
					</View>
					<TextComponent className="text-2xl font-black text-foreground">
						{totalCount}
					</TextComponent>
				</View>

				{/* Pending Stat Card */}
				<View className="flex-1 rounded-[22px] border border-border bg-card p-3.5 shadow-sm">
					<View className="flex-row items-center justify-between mb-2">
						<TextComponent className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
							Pending
						</TextComponent>
						<View className="h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10">
							<Clock
								size={13}
								color={colorScheme === 'dark' ? '#f59e0b' : '#d97706'}
							/>
						</View>
					</View>
					<TextComponent className="text-2xl font-black text-foreground">
						{pendingCount}
					</TextComponent>
				</View>

				{/* Accepted Stat Card */}
				<View className="flex-1 rounded-[22px] border border-border bg-card p-3.5 shadow-sm">
					<View className="flex-row items-center justify-between mb-2">
						<TextComponent className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
							Accepted
						</TextComponent>
						<View className="h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10">
							<CheckCircle
								size={13}
								color={colorScheme === 'dark' ? '#10b981' : '#059669'}
							/>
						</View>
					</View>
					<TextComponent className="text-2xl font-black text-foreground">
						{acceptedCount}
					</TextComponent>
				</View>
			</View>
		</View>
	);
});

export default DocumentsHeader;
