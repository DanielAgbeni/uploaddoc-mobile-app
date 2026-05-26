import React, { memo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText, Clock, CheckCircle } from 'lucide-react-native';
import CustomImage from '../../../components/common/CustomImage';
import TextComponent from '../../../components/ui/TextComponent';
import { useTheme } from '../../../providers/ThemeProvider';

interface DocumentsHeaderProps {
	acceptedCount: number;
	firstName: string;
	pendingCount: number;
	profilePicture: string | null | undefined;
	totalCount: number;
}

const DocumentsHeader = memo(function DocumentsHeader({
	acceptedCount,
	firstName,
	pendingCount,
	profilePicture,
	totalCount,
}: DocumentsHeaderProps) {
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();

	return (
		<LinearGradient
			colors={[colors.gradientStart, colors.gradientEnd]}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
			className="rounded-b-[28px] px-5 pb-5 shadow-md"
			style={{ paddingTop: insets.top + 10 }}>
			{/* Top Bar: Profile Row */}
			<View className="mb-4 flex-row items-center justify-between">
				<View className="flex-row items-center gap-3">
					<View className="h-11 w-11 overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-sm">
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
					<View>
						<TextComponent className="text-[11px] font-bold uppercase tracking-[0.8px] text-white/60">
							Good to see you,
						</TextComponent>
						<TextComponent className="text-base font-extrabold text-white leading-5">
							{firstName}
						</TextComponent>
					</View>
				</View>

				{/* UploadDoc App Badge */}
				<View className="flex-row items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 shadow-sm">
					<CustomImage
						source={require('../../../assets/app-images/icon.png')}
						className="mr-1.5 h-5 w-5 rounded-full"
						contentFit="cover"
					/>
					<TextComponent className="text-[10px] font-black uppercase tracking-[1px] text-white">
						UploadDoc
					</TextComponent>
				</View>
			</View>

			{/* Unified Dashboard Stat Bar */}
			<View className="flex-row items-center justify-between divide-x divide-white/10 rounded-[20px] border border-white/15 bg-white/10 py-3.5 shadow-sm">
				{/* Total Stat */}
				<View className="flex-1 items-center justify-center gap-1">
					<View className="flex-row items-center gap-1.5">
						<FileText
							size={13}
							color="rgba(255, 255, 255, 0.65)"
						/>
						<TextComponent className="text-[10px] font-bold uppercase tracking-[0.8px] text-white/65">
							Total
						</TextComponent>
					</View>
					<TextComponent className="text-xl font-black text-white">
						{totalCount}
					</TextComponent>
				</View>

				{/* Pending Stat */}
				<View className="flex-1 items-center justify-center gap-1">
					<View className="flex-row items-center gap-1.5">
						<Clock
							size={13}
							color="rgba(255, 255, 255, 0.65)"
						/>
						<TextComponent className="text-[10px] font-bold uppercase tracking-[0.8px] text-white/65">
							Pending
						</TextComponent>
					</View>
					<TextComponent className="text-xl font-black text-white">
						{pendingCount}
					</TextComponent>
				</View>

				{/* Accepted Stat */}
				<View className="flex-1 items-center justify-center gap-1">
					<View className="flex-row items-center gap-1.5">
						<CheckCircle
							size={13}
							color="rgba(255, 255, 255, 0.65)"
						/>
						<TextComponent className="text-[10px] font-bold uppercase tracking-[0.8px] text-white/65">
							Accepted
						</TextComponent>
					</View>
					<TextComponent className="text-xl font-black text-white">
						{acceptedCount}
					</TextComponent>
				</View>
			</View>
		</LinearGradient>
	);
});

export default DocumentsHeader;
