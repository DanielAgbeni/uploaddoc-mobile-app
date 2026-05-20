import React, { memo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomImage from '../../../components/common/CustomImage';
import TextComponent from '../../../components/ui/TextComponent';

interface DocumentsHeaderProps {
	acceptedCount: number;
	firstName: string;
	pendingCount: number;
	profilePicture: string | null | undefined;
	totalCount: number;
}

const StatCard = memo(function StatCard({
	label,
	value,
}: {
	label: string;
	value: number;
}) {
	return (
		<View className="flex-1 rounded-[22px] border border-white/15 bg-white/10 px-4 py-4">
			<TextComponent className="text-xs font-medium uppercase tracking-[1.4px] text-white/65">
				{label}
			</TextComponent>
			<TextComponent className="mt-3 text-3xl font-extrabold text-white">
				{value}
			</TextComponent>
		</View>
	);
});

const DocumentsHeader = memo(function DocumentsHeader({
	acceptedCount,
	firstName,
	pendingCount,
	profilePicture,
	totalCount,
}: DocumentsHeaderProps) {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="rounded-b-[36px] bg-primary px-5 pb-7"
			style={{ paddingTop: insets.top + 14 }}>
			<View className="mb-6 flex-row items-center justify-between">
				<View className="flex-row items-center">
					<View className="mr-3 h-14 w-14 overflow-hidden rounded-full border border-white/15 bg-white/10">
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
						<TextComponent className="text-sm font-medium text-white/70">
							Good to see you,
						</TextComponent>
						<TextComponent className="text-xl font-extrabold text-white">
							{firstName}
						</TextComponent>
					</View>
				</View>

				<View className="flex-row items-center rounded-full border border-white/15 bg-white/10 px-3 py-2">
					<CustomImage
						source={require('../../../assets/app-images/icon.png')}
						className="mr-2 h-7 w-7 rounded-full"
						contentFit="cover"
					/>
					<TextComponent className="text-xs font-semibold uppercase tracking-[1.6px] text-white/75">
						UploadDoc
					</TextComponent>
				</View>
			</View>

			<View className="mb-5">
				<TextComponent className="text-[34px] font-extrabold leading-10 tracking-tight text-white">
					Your documents,
				</TextComponent>
				<TextComponent className="mt-1 text-[34px] font-extrabold leading-10 tracking-tight text-white/80">
					beautifully organized.
				</TextComponent>
			</View>

			<View className="flex-row gap-3">
				<StatCard
					label="Total"
					value={totalCount}
				/>
				<StatCard
					label="Pending"
					value={pendingCount}
				/>
				<StatCard
					label="Accepted"
					value={acceptedCount}
				/>
			</View>
		</View>
	);
});

export default DocumentsHeader;
