import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { format } from 'date-fns';
import DocumentTextIcon from '../../../assets/icons/document-text.icon';
import DownloadIcon from '../../../assets/icons/download.icon';
import TrashIcon from '../../../assets/icons/trash.icon';
import TextComponent from '../../../components/ui/TextComponent';
import { useTheme } from '../../../providers/ThemeProvider';

type DocumentCardProps = {
	project: Project;
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

const DocumentCard = memo(function DocumentCard({
	project,
	onDelete,
	onDownload,
}: DocumentCardProps) {
	const { colorScheme, colors } = useTheme();

	const statusConfig = useMemo<StatusConfig>(() => {
		switch (project.status) {
			case 'accepted':
				return {
					label: 'Accepted',
					accent: colorScheme === 'dark' ? '#34d399' : '#047857',
					tint: colorScheme === 'dark' ? 'rgba(52, 211, 153, 0.16)' : '#d1fae5',
				};
			case 'rejected':
				return {
					label: 'Rejected',
					accent: colorScheme === 'dark' ? '#f87171' : '#b91c1c',
					tint: colorScheme === 'dark' ? 'rgba(248, 113, 113, 0.16)' : '#fee2e2',
				};
			default:
				return {
					label: 'Pending',
					accent: colorScheme === 'dark' ? '#fbbf24' : '#b45309',
					tint: colorScheme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7',
				};
		}
	}, [colorScheme, project.status]);

	const metadata = useMemo(() => {
		const items = [
			formatFileSize(project.fileSize),
			format(new Date(project.createdAt), 'MMM dd, yyyy'),
		];

		if (project.pageCount > 0) {
			items.push(`${project.pageCount} pages`);
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

	return (
		<View className="mb-4 rounded-[28px] border border-border bg-card px-4 py-4 shadow-sm">
			<View className="flex-row items-start">
				<View
					className="mr-4 h-14 w-14 items-center justify-center rounded-[20px]"
					style={{ backgroundColor: `${colors.primary}18` }}>
					<DocumentTextIcon
						size={26}
						color={colors.primary}
					/>
				</View>

				<View className="flex-1">
					<View className="mb-3 flex-row items-start justify-between gap-3">
						<View className="flex-1">
							<TextComponent
								className="text-lg font-extrabold leading-6 text-foreground"
								numberOfLines={2}>
								{project.title}
							</TextComponent>

							<TextComponent
								className="mt-2 text-sm leading-6 text-muted-foreground"
								numberOfLines={2}>
								{project.description || 'Document submission ready for review.'}
							</TextComponent>
						</View>

						<View
							className="rounded-full px-3 py-2"
							style={{ backgroundColor: statusConfig.tint }}>
							<TextComponent
								className="text-xs font-bold uppercase tracking-[1.2px]"
								style={{ color: statusConfig.accent }}>
								{statusConfig.label}
							</TextComponent>
						</View>
					</View>

					<View className="mb-4 flex-row flex-wrap gap-2">
						{metadata.map((item) => (
							<View
								key={`${project._id}-${item}`}
								className="rounded-full border border-border px-3 py-2">
								<TextComponent className="text-xs font-medium capitalize text-muted-foreground">
									{item}
								</TextComponent>
							</View>
						))}
					</View>

					<View className="flex-row items-center justify-between border-t border-border pt-4">
						<View className="flex-1 pr-3">
							<TextComponent className="text-xs font-semibold uppercase tracking-[1.3px] text-muted-foreground">
								Assigned to
							</TextComponent>
							<TextComponent
								className="mt-1 text-sm font-semibold text-foreground"
								numberOfLines={1}>
								{project.assignedAdminName || 'UploadDoc'}
							</TextComponent>
						</View>

						<View className="flex-row gap-2">
							{project.fileUrl ? (
								<Pressable
									onPress={handleDownloadPress}
									className="min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border bg-background active:opacity-85">
									<DownloadIcon
										size={18}
										color={colors.foreground}
									/>
								</Pressable>
							) : null}

							<Pressable
								onPress={handleDeletePress}
								className="min-h-[44px] min-w-[44px] items-center justify-center rounded-full active:opacity-85"
								style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2' }}>
								<TrashIcon
									size={18}
									color="#ef4444"
								/>
							</Pressable>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
});

export default DocumentCard;
