import React, { memo, useState, useCallback, useMemo } from 'react';
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
import { MailIcon } from '../../../assets/icons';

type ProjectCardProps = {
	project: Project;
	onDelete: (id: string) => void;
	onDownload: (project: Project) => void;
	onAccept: (id: string) => void;
	onChat: (project: Project) => void;
	isAccepting?: boolean;
};

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getStatusConfig = (status: string) => {
	switch (status) {
		case 'accepted':
			return {
				containerClass: 'bg-green-100/70 dark:bg-green-950/30 border-green-200/50 dark:border-green-800/30',
				textClass: 'text-green-700 dark:text-green-400',
				dotClass: 'bg-green-500',
				label: 'Accepted',
			};
		case 'rejected':
			return {
				containerClass: 'bg-red-100/70 dark:bg-red-950/30 border-red-200/50 dark:border-red-800/30',
				textClass: 'text-red-700 dark:text-red-400',
				dotClass: 'bg-red-500',
				label: 'Rejected',
			};
		default:
			return {
				containerClass: 'bg-yellow-100/70 dark:bg-yellow-950/30 border-yellow-200/50 dark:border-yellow-800/30',
				textClass: 'text-yellow-700 dark:text-yellow-400',
				dotClass: 'bg-yellow-500',
				label: 'Pending',
			};
	}
};

const ProjectCard = ({
	project,
	onDelete,
	onDownload,
	onAccept,
	onChat,
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

	const activeProvider = useMemo(() => cloudData ? getActiveProvider(cloudData) : null, [cloudData]);
	const providerName = useMemo(() => activeProvider?.providerName || 'Cloud', [activeProvider]);

	const handleSync = useCallback(async () => {
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
			switch (activeProvider.providerName) {
				case 'google-drive':
					await syncProject(project._id);
					break;
				case 'onedrive':
					await syncProjectToOneDrive(project._id);
					break;
				case 'dropbox':
					await syncProjectToDropbox(project._id);
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
	}, [activeProvider, project._id, providerName, queryClient]);

	const handleAcceptPress = useCallback(() => {
		onAccept(project._id);
	}, [onAccept, project._id]);

	const handleDeletePress = useCallback(() => {
		onDelete(project._id);
	}, [onDelete, project._id]);

	const handleDownloadPress = useCallback(() => {
		onDownload(project);
	}, [onDownload, project]);

	const handleChatPress = useCallback(() => {
		onChat(project);
	}, [onChat, project]);

	const handleOpenDriveUrl = useCallback(() => {
		if (project.driveSync?.driveFileUrl) {
			Linking.openURL(project.driveSync.driveFileUrl);
		}
	}, [project.driveSync?.driveFileUrl]);

	const statusInfo = useMemo(() => getStatusConfig(project.status), [project.status]);

	return (
		<View className="bg-card border border-border/60 rounded-[24px] overflow-hidden shadow-sm mb-4 mx-4">
			<View className="p-4 flex-row gap-4">
				{/* Thumbnail */}
				<View className="h-14 w-14 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-border/80 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
					{project.filePreview ? (
						<Image
							source={{ uri: project.filePreview }}
							className="w-full h-full"
							resizeMode="cover"
						/>
					) : (
						<FileText
							size={24}
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
								className="font-bold text-base text-foreground truncate flex-1 mr-2"
								numberOfLines={1}>
								{project.title}
							</TextComponent>

							{/* Status Badge */}
							<View
								className={`px-2 py-0.5 rounded-full border flex-row items-center gap-1 ${statusInfo.containerClass}`}>
								<View className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
								<TextComponent
									className={`text-[9px] font-black uppercase tracking-[0.5px] ${statusInfo.textClass}`}>
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

					<View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
						<View className="bg-primary/5 dark:bg-primary/10 border border-primary/10 px-2 py-0.5 rounded-md">
							<TextComponent className="text-[10px] font-bold uppercase tracking-[0.3px] text-primary">
								{project.fileCategory}
							</TextComponent>
						</View>
						<TextComponent className="text-xs font-semibold text-muted-foreground">
							{formatFileSize(project.fileSize)}
						</TextComponent>
						{project.pageCount > 0 ? (
							<>
								<TextComponent className="text-xs text-muted-foreground">•</TextComponent>
								<TextComponent className="text-xs font-semibold text-muted-foreground">
									{project.pageCount} pg
								</TextComponent>
							</>
						) : null}
					</View>
				</View>
			</View>

			{/* Footer / Actions */}
			<View className="px-4 py-3 bg-muted/10 border-t border-border/40 flex-row items-center justify-between">
				{/* Cloud Sync Status */}
				<View className="flex-1 mr-4">
					{project.status === 'accepted' ? (
						<View className="flex-row items-center gap-1.5">
							{project.driveSync?.synced ? (
								<Pressable
									onPress={handleOpenDriveUrl}
									className="flex-row items-center gap-1.5 active:opacity-75">
									<Cloud
										size={14}
										color="#16a34a"
									/>
									<TextComponent className="text-xs text-green-600 font-bold">
										Synced
									</TextComponent>
									{project.driveSync.driveFileUrl ? (
										<ExternalLink
											size={10}
											color="#16a34a"
										/>
									) : null}
								</Pressable>
							) : (
								<View className="flex-row items-center gap-1.5">
									<CloudOff
										size={14}
										color={colors.mutedForeground}
									/>
									<TextComponent className="text-xs text-muted-foreground font-semibold">
										Not synced
									</TextComponent>
								</View>
							)}
						</View>
					) : (
						<TextComponent className="text-xs text-muted-foreground font-semibold italic">
							Action required
						</TextComponent>
					)}
				</View>

				{/* Action Buttons */}
				<View className="flex-row items-center gap-2">
					<Pressable
						onPress={handleChatPress}
						className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center active:scale-90">
						<MailIcon
							size={18}
							color={colors.primary}
						/>
					</Pressable>

					{project.status === 'pending' ? (
						<Pressable
							onPress={handleAcceptPress}
							disabled={isAccepting}
							className={`h-10 w-10 rounded-full flex items-center justify-center border border-green-500/20 bg-green-500/10 active:scale-90`}>
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
					) : null}

					{project.status === 'accepted' ? (
						<>
							{/* Sync Button */}
							{!project.driveSync?.synced ? (
								<Pressable
									onPress={handleSync}
									disabled={isSyncing}
									className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center active:scale-90">
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
							) : null}

							{project.fileUrl ? (
								<Pressable
									onPress={handleDownloadPress}
									className="h-10 w-10 rounded-full bg-muted border border-border/80 flex items-center justify-center active:scale-90">
									<Download
										size={18}
										color={colors.foreground}
										strokeWidth={1.5}
									/>
								</Pressable>
							) : null}
						</>
					) : null}

					<Pressable
						onPress={handleDeletePress}
						className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center active:scale-90">
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
