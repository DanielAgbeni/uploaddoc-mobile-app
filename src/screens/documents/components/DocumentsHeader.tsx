import React, { memo } from 'react';
import { View, Text } from 'react-native';
import CustomImage from '../../../components/common/CustomImage';
import { useUserStore } from '../../../shared/user-store/useUserStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DocumentsHeader = () => {
	const { user } = useUserStore();
	const insets = useSafeAreaInsets();

	const firstName = user?.name?.split(' ')[0] || 'User';

	return (
		<View
			className="bg-primary rounded-b-[32px] px-6 pb-8 shadow-lg z-10"
			style={{ paddingTop: insets.top + 16 }}>
			<View className="flex-row justify-between items-center mb-6">
				<View className="flex-row items-center gap-3">
					<View className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
						<CustomImage
							source={require('../../../assets/app-images/icon.png')}
							className="w-8 h-8 rounded-lg"
							contentFit="cover"
						/>
					</View>
					<Text className="text-white font-bold text-xl tracking-tight">
						UploadDoc
					</Text>
				</View>

				<View className="items-end">
					<Text className="text-blue-100 text-sm font-medium">
						Welcome back,
					</Text>
					<Text className="text-white font-bold text-lg">{firstName}</Text>
				</View>
			</View>

			<View>
				<Text className="text-3xl font-bold text-white mb-2">Documents</Text>
				<Text className="text-blue-100 text-base">
					Track and manage your project submissions
				</Text>
			</View>
		</View>
	);
};

export default memo(DocumentsHeader);
