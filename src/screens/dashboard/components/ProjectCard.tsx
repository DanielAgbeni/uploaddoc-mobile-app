import React, { memo, useState } from 'react';
import {
	View,
	Pressable,
	Image,
	ActivityIndicator,
	Linking,
} from 'react-native';
/* Icons */
import {
	FileText,
	Download,
	Trash2,
	CheckCircle,
	Cloud,
	CloudOff,
	ExternalLink,
	Clock,
	XCircle,
} from 'lucide-react-native';
import { TextComponent } from 'src/components';
import { useTheme } from 'src/providers/ThemeProvider';
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
	const { colors } = useTheme();
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
					Icon: CheckCircle,
					color: '#16a34a', // green-600
					// SOLID COLORS: green-100 (light), green-950 (dark)
					containerClass:
						'bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-800',
					textClass: 'text-green-700 dark:text-green-400',
					label: 'Accepted',
				};
			case 'rejected':
				return {
					Icon: XCircle,
					color: '#dc2626', // red-600
					// SOLID COLORS: red-100 (light), red-950 (dark)
					containerClass:
						'bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-800',
					textClass: 'text-red-700 dark:text-red-400',
					label: 'Rejected',
				};
			default:
				return {
					Icon: Clock,
					color: '#ca8a04', // yellow-600
					// SOLID COLORS: yellow-100 (light), yellow-950 (dark)
					containerClass:
						'bg-yellow-100 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
					textClass: 'text-yellow-700 dark:text-yellow-400',
					label: 'Pending',
				};
		}
	};

	const statusInfo = getStatusConfig(project.status);
	const StatusIcon = statusInfo.Icon;

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<View className="bg-card border border-border rounded-3xl overflow-hidden shadow-md mb-4 mx-4">
			<View className="p-4 flex-row gap-4">
				{/* Thumbnail */}
				<View className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-slate-900 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
					{project.filePreview ? (
						<Image
							source={{ uri: project.filePreview }}
							className="w-full h-full"
							resizeMode="cover"
						/>
					) : (
						<FileText
							size={28}
							color={colors.primary}
							strokeWidth={1.5}
						/>
					)}
				</View>

				{/* Content */}
				<View className="flex-1 min-w-0 justify-between py-0.5">
					<View>
						<View className="flex-row items-start justify-between">
							<TextComponent
								className="font-bold text-lg text-foreground truncate flex-1 mr-2"
								numberOfLines={1}>
								{project.title}
							</TextComponent>

							{/* Status Badge */}
							<View
								className={`px-1.5 py-0.5 rounded-full border ${statusInfo.containerClass}`}>
								<TextComponent
									className={`text-xs font-bold uppercase tracking-tighter ${statusInfo.textClass}`}>
									{statusInfo.label}
								</TextComponent>
							</View>
						</View>

						<TextComponent
							className="text-xs text-muted-foreground truncate mt-0.5"
							numberOfLines={1}>
							{project.studentName} • {project.matricNumber || 'No ID'}
						</TextComponent>
					</View>

					<View className="flex-row items-center gap-3 mt-2">
						<View className="bg-muted px-2 py-1 rounded-md">
							<TextComponent className="text-xs font-medium text-muted-foreground">
								{project.fileCategory}
							</TextComponent>
						</View>
						<TextComponent className="text-xs text-muted-foreground">
							{formatFileSize(project.fileSize)}
						</TextComponent>
						{project.pageCount > 0 && (
							<TextComponent className="text-xs text-muted-foreground">
								• {project.pageCount} pg
							</TextComponent>
						)}
					</View>
				</View>
			</View>

			{/* Divider */}
			{/* <View className="h-[1px] bg-border mx-4" /> */}

			{/* Footer / Actions */}
			<View className="px-4 py-3 bg-muted/30 border-t border-border flex-row items-center justify-between">
				{/* Cloud Sync Status */}
				<View className="flex-1 mr-4">
					{project.status === 'accepted' ? (
						<View className="flex-row items-center gap-1.5">
							{project.driveSync?.synced ? (
								<Pressable
									onPress={() =>
										project.driveSync?.driveFileUrl &&
										Linking.openURL(project.driveSync.driveFileUrl)
									}
									className="flex-row items-center gap-1.5">
									<Cloud
										size={14}
										color="#16a34a"
									/>
									<TextComponent className="text-xs text-green-600 font-medium">
										Synced
									</TextComponent>
									{project.driveSync.driveFileUrl && (
										<ExternalLink
											size={10}
											color="#16a34a"
										/>
									)}
								</Pressable>
							) : (
								<View className="flex-row items-center gap-1.5">
									<CloudOff
										size={14}
										color={colors.mutedForeground}
									/>
									<TextComponent className="text-xs text-muted-foreground">
										Not synced
									</TextComponent>
								</View>
							)}
						</View>
					) : (
						<TextComponent className="text-xs text-muted-foreground italic">
							Action required
						</TextComponent>
					)}
				</View>

				{/* Action Buttons */}
				<View className="flex-row items-center gap-3">
					{project.status === 'pending' && (
						<Pressable
							onPress={() => onAccept(project._id)}
							disabled={isAccepting}
							className={`h-11 w-11 rounded-full flex items-center justify-center border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 ${isAccepting ? 'opacity-100 bg-muted' : 'active:scale-95'}`}
							style={isAccepting ? { backgroundColor: colors.muted } : {}}>
							{isAccepting ? (
								<ActivityIndicator
									size="small"
									color="#16a34a"
								/>
							) : (
								<CheckCircle
									size={18}
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
									className="h-11 w-11 rounded-full bg-background border border-border flex items-center justify-center shadow-sm active:scale-95">
									{isSyncing ? (
										<ActivityIndicator
											size="small"
											color={colors.primary}
										/>
									) : (
										<Cloud
											size={18}
											color={colors.primary}
										/>
									)}
								</Pressable>
							)}

							{project.fileUrl && (
								<Pressable
									onPress={() => onDownload(project)}
									className="h-11 w-11 rounded-full bg-background border border-border flex items-center justify-center shadow-sm active:scale-95">
									<Download
										size={18}
										color={colors.foreground}
										strokeWidth={1.5}
									/>
								</Pressable>
							)}
						</>
					)}

					<Pressable
						onPress={() => onDelete(project._id)}
						className="h-11 w-11 rounded-full bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 flex items-center justify-center active:scale-95">
						<Trash2
							size={18}
							color="#ef4444"
						/>
					</Pressable>
				</View>
			</View>
		</View>
	);
};

export default memo(ProjectCard);
