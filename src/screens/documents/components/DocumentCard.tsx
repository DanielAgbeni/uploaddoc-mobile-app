import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import DocumentTextIcon from '../../../assets/icons/document-text.icon';
import CheckmarkCircleIcon from '../../../assets/icons/checkmark-circle.icon';
import CloseCircleIcon from '../../../assets/icons/close-circle.icon';
import TimeIcon from '../../../assets/icons/time.icon';
import DownloadIcon from '../../../assets/icons/download.icon';
import TrashIcon from '../../../assets/icons/trash.icon';
import { format } from 'date-fns';

type DocumentCardProps = {
	project: Project;
	onDelete: (id: string) => void;
	onDownload: (url: string) => void;
};

const DocumentCard = ({ project, onDelete, onDownload }: DocumentCardProps) => {
	const getStatusConfig = (status: string) => {
		switch (status) {
			case 'accepted':
				return {
					icon: 'checkmark-circle',
					border: 'border-green-200 dark:border-green-900/30',
					text: 'text-green-700 dark:text-green-400',
					badgeIcon: 'checkmark-circle-outline',
				};
			case 'rejected':
				return {
					icon: 'close-circle',
					border: 'border-red-200 dark:border-red-900/30',
					text: 'text-red-700 dark:text-red-400',
					badgeIcon: 'close-circle-outline',
				};
			default:
				return {
					icon: 'time',
					border: 'border-yellow-200 dark:border-yellow-900/30',
					text: 'text-yellow-700 dark:text-yellow-400',
					badgeIcon: 'time-outline',
				};
		}
	};

	const statusConfig = getStatusConfig(project.status);

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<View className="bg-card border border-border rounded-xl p-4 mb-3 shadow-sm mx-4">
			<View className="flex-row items-center gap-4">
				{/* Icon Container */}
				<View className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
					<DocumentTextIcon
						size={24}
						color="#4F46E5"
					/>
				</View>

				{/* Content */}
				<View className="flex-1 min-w-0 gap-1">
					<View className="flex-row justify-between items-start">
						<Text
							className="font-semibold text-foreground text-base truncate flex-1 mr-2"
							numberOfLines={1}>
							{project.title}
						</Text>
						{/* Actions Menu (Simplified for mobile) */}
						{/* Using a simple row of actions for now, or could use a proper menu if desired */}
					</View>

					<View className="flex-row items-center gap-2 flex-wrap">
						<Text className="text-xs text-muted-foreground font-normal">
							{formatFileSize(project.fileSize)}
						</Text>
						<View className="w-1 h-1 rounded-full bg-muted-foreground/40" />
						<Text className="text-xs text-muted-foreground font-normal">
							{format(new Date(project.createdAt), 'MMM dd, yyyy')}
						</Text>
						{project.pageCount > 0 && (
							<>
								<View className="w-1 h-1 rounded-full bg-muted-foreground/40" />
								<Text className="text-xs text-muted-foreground font-normal">
									{project.pageCount} pages
								</Text>
							</>
						)}
					</View>

					<View className="flex-row justify-between items-center mt-2">
						<View
							className={`flex-row items-center px-2.5 py-1 rounded-full border ${statusConfig.border}`}>
							<Text
								className={`text-xs font-medium capitalize ${statusConfig.text}`}>
								{project.status}
							</Text>
						</View>

						<View className="flex-row gap-1">
							{project.fileUrl && (
								<Pressable
									onPress={() => onDownload(project.fileUrl!)}
									className="p-2 rounded-full active:bg-muted">
									<DownloadIcon
										size={18}
										color="#64748b"
									/>
								</Pressable>
							)}
							<Pressable
								onPress={() => onDelete(project._id)}
								className="p-2 rounded-full active:bg-red-50">
								<TrashIcon
									size={18}
									color="#ef4444"
								/>
							</Pressable>
						</View>
					</View>
				</View>
			</View>
			<View className="mt-3 pt-3 border-t border-border flex-row justify-between items-center">
				<Text className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
					Assigned To
				</Text>
				<Text className="text-sm font-medium text-foreground/80">
					{project.assignedAdminName || 'UploadDoc'}
				</Text>
			</View>
		</View>
	);
};

export default memo(DocumentCard);
