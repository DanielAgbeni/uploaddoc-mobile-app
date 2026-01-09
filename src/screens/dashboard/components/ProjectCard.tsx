import React, { memo, useState } from 'react';
import {
	View,
	Pressable,
	Image,
	ActivityIndicator,
	Linking,
} from 'react-native';
import DocumentTextIcon from '../../../assets/icons/document-text.icon';
import DownloadIcon from '../../../assets/icons/download.icon';
import TrashIcon from '../../../assets/icons/trash.icon';
import CheckmarkCircleIcon from '../../../assets/icons/checkmark-circle.icon';
import { TextComponent } from 'src/components';
import CloudIcon from '../../../assets/icons/cloud.icon';
import CloudOffIcon from '../../../assets/icons/cloud-off.icon';
import ExternalLinkIcon from '../../../assets/icons/external-link.icon';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllCloudStatus, getActiveProvider } from '../../../api/cloudSync';
import { syncProject } from '../../../api/googledrive';
import { syncProjectToOneDrive } from '../../../api/onedrive';
import { syncProjectToDropbox } from '../../../api/dropbox';
import { showMessage } from 'react-native-flash-message';

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
	const queryClient = useQueryClient();
	const [isSyncing, setIsSyncing] = useState(false);

	// Get Cloud Status
	const { data: cloudData } = useQuery({
		queryKey: ['allCloudStatus'],
		queryFn: getAllCloudStatus,
		staleTime: 60000,
	});

	const activeProvider = cloudData ? getActiveProvider(cloudData) : null;
	const providerName = activeProvider?.providerName || 'Cloud';

	const handleSync = async () => {
		if (!activeProvider) {
			showMessage({
				message: 'No Cloud Connected',
				description:
					'Please connect a cloud storage provider in your profile settings',
				type: 'warning',
				icon: 'warning',
			});
			return;
		}

		setIsSyncing(true);
		try {
			let result;
			switch (activeProvider.providerName) {
				case 'google-drive':
					result = await syncProject(project._id);
					break;
				case 'onedrive':
					result = await syncProjectToOneDrive(project._id);
					break;
				case 'dropbox':
					result = await syncProjectToDropbox(project._id);
					break;
			}

			showMessage({
				message: 'Success',
				description: `Document synced to ${providerName}`,
				type: 'success',
				icon: 'success',
			});

			queryClient.invalidateQueries({ queryKey: ['assignedProjects'] });
		} catch (error: any) {
			console.error('Sync error:', error);
			if (error.response?.status === 400 && error.response?.data?.driveUrl) {
				showMessage({
					message: 'Info',
					description: 'Document is already synced',
					type: 'info',
					icon: 'info',
				});
			} else {
				showMessage({
					message: 'Sync Failed',
					description:
						error.response?.data?.message ||
						`Failed to sync to ${providerName}`,
					type: 'danger',
					icon: 'danger',
				});
			}
		} finally {
			setIsSyncing(false);
		}
	};

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
							<TextComponent className="text-sm text-muted-foreground">
								{project.fileCategory}
							</TextComponent>
						</View>
						<TextComponent className="text-sm text-muted-foreground">
							{formatFileSize(project.fileSize)}
						</TextComponent>
						{project.pageCount > 0 && (
							<TextComponent className="text-sm text-muted-foreground">
								• {project.pageCount} pg
							</TextComponent>
						)}
					</View>

					{/* Cloud Sync Status (if accepted) */}
					{project.status === 'accepted' && (
						<View className="mt-1 flex-row items-center gap-1">
							{project.driveSync?.synced ? (
								<Pressable
									onPress={() =>
										project.driveSync?.driveFileUrl &&
										Linking.openURL(project.driveSync.driveFileUrl)
									}
									className="flex-row items-center gap-1">
									<CloudIcon
										size={10}
										color="#22c55e"
									/>
									<TextComponent className="text-[10px] text-green-600 font-medium">
										Synced
									</TextComponent>
									{project.driveSync.driveFileUrl && (
										<ExternalLinkIcon
											size={8}
											color="#22c55e"
										/>
									)}
								</Pressable>
							) : (
								<View className="flex-row items-center gap-1">
									<CloudOffIcon
										size={10}
										color="#94a3b8"
									/>
									<TextComponent className="text-[10px] text-muted-foreground">
										Not synced
									</TextComponent>
								</View>
							)}
						</View>
					)}
				</View>

				{/* Actions */}
				<View className="flex-row items-center gap-1">
					{project.status === 'pending' && (
						<Pressable
							onPress={() => onAccept(project._id)}
							disabled={isAccepting}
							className={`p-2 rounded-full ${isAccepting ? 'opacity-50' : 'active:bg-green-50'}`}>
							{isAccepting ? (
								<ActivityIndicator
									size="small"
									color="#16a34a"
								/>
							) : (
								<CheckmarkCircleIcon
									size={20}
									color="#16a34a"
								/>
							)}
						</Pressable>
					)}

					{project.status === 'accepted' && (
						<>
							{/* Sync Button */}
							{!project.driveSync?.synced && (
								<Pressable
									onPress={handleSync}
									disabled={isSyncing}
									className="p-2 rounded-full active:bg-muted">
									{isSyncing ? (
										<ActivityIndicator
											size="small"
											color="#4F46E5"
										/>
									) : (
										<CloudIcon
											size={20}
											color="#4F46E5"
										/>
									)}
								</Pressable>
							)}

							{project.fileUrl && (
								<Pressable
									onPress={() => onDownload(project)}
									className="p-2 rounded-full active:bg-muted">
									<DownloadIcon
										size={20}
										color="#64748b"
									/>
								</Pressable>
							)}
						</>
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
