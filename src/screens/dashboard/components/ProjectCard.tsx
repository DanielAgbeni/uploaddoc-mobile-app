import React, { memo } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import DocumentTextIcon from '../../../assets/icons/document-text.icon';
import DownloadIcon from '../../../assets/icons/download.icon';
import TrashIcon from '../../../assets/icons/trash.icon';
import CheckmarkCircleIcon from '../../../assets/icons/checkmark-circle.icon';
import { format } from 'date-fns';
import { TextComponent } from 'src/components';
type ProjectCardProps = {
	project: Project;
	onDelete: (id: string) => void;
	onDownload: (project: Project) => void;
	onAccept: (id: string) => void;
	isAccepting?: boolean;
};

const ProjectCard = ({
	project,
	onDelete,
	onDownload,
	onAccept,
	isAccepting,
}: ProjectCardProps) => {
	const getStatusConfig = (status: string) => {
		switch (status) {
			case 'accepted':
				return {
					icon: 'checkmark-circle',
					border: 'border-green-200 dark:border-green-900/30',
					bg: 'bg-green-100 dark:bg-green-900/20',
					text: 'text-green-700 dark:text-green-400',
				};
			case 'rejected':
				return {
					icon: 'close-circle',
					border: 'border-red-200 dark:border-red-900/30',
					bg: 'bg-red-100 dark:bg-red-900/20',
					text: 'text-red-700 dark:text-red-400',
				};
			default:
				return {
					icon: 'time',
					border: 'border-yellow-200 dark:border-yellow-900/30',
					bg: 'bg-yellow-100 dark:bg-yellow-900/20',
					text: 'text-yellow-700 dark:text-yellow-400',
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
		<View className="bg-card border border-border rounded-xl p-3 mb-2 shadow-sm mx-4">
			<View className="flex-row items-center gap-3">
				{/* Thumbnail */}
				<View className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
					{project.filePreview ? (
						<Image
							source={{ uri: project.filePreview }}
							className="w-full h-full"
							resizeMode="cover"
						/>
					) : (
						<DocumentTextIcon
							size={24}
							color="#4F46E5"
						/>
					)}
				</View>

				{/* Content */}
				<View className="flex-1 min-w-0">
					<View className="flex-row items-center gap-2 mb-0.5">
						<View
							className={`w-2 h-2 rounded-full ${statusConfig.text.replace('text-', 'bg-')}`}
						/>
						<TextComponent
							className="font-medium text-sm text-foreground truncate"
							numberOfLines={1}>
							{project.title}
						</TextComponent>
					</View>

					<TextComponent
						className="text-xs text-muted-foreground truncate mb-1"
						numberOfLines={1}>
						{project.studentName} • {project.matricNumber || 'No Matric'}
					</TextComponent>

					<View className="flex-row items-center gap-2">
						<View className="bg-muted px-1.5 py-0.5 rounded">
							<TextComponent className="text-[10px] text-muted-foreground uppercase">
								{project.fileCategory}
							</TextComponent>
						</View>
						<TextComponent className="text-[10px] text-muted-foreground">
							{formatFileSize(project.fileSize)}
						</TextComponent>
						{project.pageCount > 0 && (
							<TextComponent className="text-[10px] text-muted-foreground">
								• {project.pageCount} pg
							</TextComponent>
						)}
					</View>
				</View>

				{/* Actions */}
				<View className="flex-row items-center gap-1">
					{project.status === 'pending' && (
						<Pressable
							onPress={() => onAccept(project._id)}
							disabled={isAccepting}
							className={`p-2 rounded-full ${isAccepting ? 'opacity-50' : 'active:bg-green-50'}`}>
							<CheckmarkCircleIcon
								size={20}
								color="#16a34a"
							/>
						</Pressable>
					)}
					{project.fileUrl && project.status === 'accepted' && (
						<Pressable
							onPress={() => onDownload(project)}
							className="p-2 rounded-full active:bg-muted">
							<DownloadIcon
								size={20}
								color="#64748b"
							/>
						</Pressable>
					)}
					<Pressable
						onPress={() => onDelete(project._id)}
						className="p-2 rounded-full active:bg-red-50">
						<TrashIcon
							size={20}
							color="#ef4444"
						/>
					</Pressable>
				</View>
			</View>
		</View>
	);
};

export default memo(ProjectCard);
