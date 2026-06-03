import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { format } from 'date-fns';
import DocumentTextIcon from '../../../assets/icons/document-text.icon';
import DownloadIcon from '../../../assets/icons/download.icon';
import MailIcon from '../../../assets/icons/mail.icon';
import TrashIcon from '../../../assets/icons/trash.icon';
import TextComponent from '../../../components/ui/TextComponent';
import { useTheme } from '../../../providers/ThemeProvider';

type DocumentCardProps = {
	project: Project;
	onChat: (project: Project) => void;
	onDelete: (id: string) => void;
	onDownload: (project: Project) => void;
};

type StatusConfig = {
	accent: string;
	label: string;
	tint: string;
};

const formatFileSize = (bytes: number) => {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getInitials = (name?: string) => {
	if (!name) return 'UD';
	const parts = name.trim().split(/\s+/);
	if (parts.length === 0) return 'UD';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const DocumentCard = memo(function DocumentCard({
	project,
	onChat,
	onDelete,
	onDownload,
}: DocumentCardProps) {
	const { colorScheme, colors } = useTheme();

	const statusConfig = useMemo<StatusConfig>(() => {
		switch (project.status) {
			case 'accepted':
				return {
					label: 'Accepted',
					accent: colorScheme === 'dark' ? '#10b981' : '#059669',
					tint: colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#d1fae5',
				};
			case 'rejected':
				return {
					label: 'Rejected',
					accent: colorScheme === 'dark' ? '#ef4444' : '#dc2626',
					tint: colorScheme === 'dark' ? 'rgba(239, 68, 68, 0.12)' : '#fee2e2',
				};
			default:
				return {
					label: 'Pending',
					accent: colorScheme === 'dark' ? '#f59e0b' : '#d97706',
					tint: colorScheme === 'dark' ? 'rgba(245, 158, 11, 0.12)' : '#fef3c7',
				};
		}
	}, [colorScheme, project.status]);

	const metadata = useMemo(() => {
		const items = [
			formatFileSize(project.fileSize),
			format(new Date(project.createdAt), 'MMM dd, yyyy'),
		];

		if (project.pageCount > 0) {
			items.push(`${project.pageCount} pgs`);
		}

		if (project.fileCategory) {
			items.push(project.fileCategory);
		}

		return items;
	}, [project.createdAt, project.fileCategory, project.fileSize, project.pageCount]);

	const handleDeletePress = useCallback(() => {
		onDelete(project._id);
	}, [onDelete, project._id]);

	const handleDownloadPress = useCallback(() => {
		onDownload(project);
	}, [onDownload, project]);

	const handleChatPress = useCallback(() => {
		onChat(project);
	}, [onChat, project]);

	return (
		<View className="mb-4 rounded-[24px] border border-border bg-card px-5 py-5 shadow-sm relative overflow-hidden">
			{/* Main Card Content */}
			<View className="flex-1">
				
				{/* Header Section: Title & Status Badge */}
				<View className="flex-row items-start justify-between gap-3 mb-3">
					<View className="flex-1 flex-row items-start">
						{/* Document Icon */}
						<View
							className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
							style={{ backgroundColor: `${colors.primary}12` }}>
							<DocumentTextIcon
								size={20}
								color={colors.primary}
							/>
						</View>

						<View className="flex-1 pr-1">
							<TextComponent
								className="text-base font-bold leading-5 text-foreground"
								numberOfLines={2}>
								{project.title}
							</TextComponent>
						</View>
					</View>

					{/* Status badge pill with dot */}
					<View
						className="flex-row items-center rounded-full px-2.5 py-1"
						style={{ backgroundColor: statusConfig.tint }}>
						<View
							className="w-1.5 h-1.5 rounded-full mr-1.5"
							style={{ backgroundColor: statusConfig.accent }}
						/>
						<TextComponent
							className="text-[10px] font-extrabold uppercase tracking-[0.5px]"
							style={{ color: statusConfig.accent }}>
							{statusConfig.label}
						</TextComponent>
					</View>
				</View>

				{/* Description text - Laid out naturally below the header, no left indent */}
				<View className="mb-3">
					<TextComponent
						className="text-xs leading-5 text-foreground font-semibold"
						style={{ opacity: 0.65 }}
						numberOfLines={2}>
						{project.description || 'Document submission ready for review.'}
					</TextComponent>
				</View>

				{/* Metadata row separated by bullets - Laid out naturally, no left indent */}
				<View className="mb-4">
					<TextComponent 
						className="text-[11px] font-medium text-foreground"
						style={{ opacity: 0.45 }}>
						{metadata.join('  \u2022  ')}
					</TextComponent>
				</View>

				{/* Footer Section: Assigned to & Actions */}
				<View className="flex-row items-center justify-between border-t border-border pt-4 pl-1">
					
					{/* Assigned Receiver */}
					<View className="flex-row items-center flex-1 pr-3">
						<View
							className="h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border mr-2.5">
							<TextComponent className="text-[11px] font-black text-primary">
								{getInitials(project.assignedAdminName)}
							</TextComponent>
						</View>
						<View className="flex-1">
							<TextComponent 
								className="text-[9px] font-bold uppercase tracking-[0.8px] text-foreground"
								style={{ opacity: 0.45 }}>
								Receiver
							</TextComponent>
							<TextComponent
								className="text-sm font-bold text-foreground"
								numberOfLines={1}>
								{project.assignedAdminName || 'UploadDoc'}
							</TextComponent>
						</View>
					</View>

					{/* Glassmorphic Action Buttons */}
					<View className="flex-row gap-2">
						
							<Pressable
								onPress={handleChatPress}
								className="h-9 w-9 items-center justify-center rounded-full active:opacity-85 border border bg-primary/10"
								style={({ pressed }) => ({
									transform: [{ scale: pressed ? 0.95 : 1 }],
								})}>
								<MailIcon
									size={16}
									color={colors.primary}
								/>
							</Pressable>
						

						{project.fileUrl ? (
							<Pressable
								onPress={handleDownloadPress}
								className="h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 active:opacity-85"
								style={({ pressed }) => ({
									transform: [{ scale: pressed ? 0.95 : 1 }],
								})}>
								<DownloadIcon
									size={16}
									color={colors.foreground}
								/>
							</Pressable>
						) : null}

						<Pressable
							onPress={handleDeletePress}
							className="h-9 w-9 items-center justify-center rounded-full active:opacity-85 border border-destructive/20 bg-destructive/10"
							style={({ pressed }) => ({
								transform: [{ scale: pressed ? 0.95 : 1 }],
							})}>
							<TrashIcon
								size={16}
								color="#ef4444"
							/>
						</Pressable>
					</View>
				</View>
			</View>
		</View>
	);
});

export default DocumentCard;
