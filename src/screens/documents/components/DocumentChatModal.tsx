import React, {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	TextInput,
	View,
} from 'react-native';
import Modal from 'react-native-modal';
import { format } from 'date-fns';
import { onValue, push, ref, serverTimestamp } from 'firebase/database';
import { FlashList } from '@shopify/flash-list';
import { CloseIcon, SendIcon } from '../../../assets/icons';
import { sendNotification } from '../../../api/notifications';
import TextComponent from '../../../components/ui/TextComponent';
import { useTheme } from '../../../providers/ThemeProvider';
import { firebaseDatabase } from '../../../services/firebase';

interface DocumentChatModalProps {
	currentUser: UserDetailsType | null;
	isVisible: boolean;
	onClose: () => void;
	project: Project | null;
}

type FirebaseChatMessageRecord = {
	senderId?: string;
	senderName?: string;
	text?: string;
	timestamp?: number | null;
};

type ChatListItem =
	| { type: 'message'; message: DocumentChatMessage; id: string }
	| { type: 'dateDivider'; dateString: string; id: string };

const CHAT_LOAD_TIMEOUT_MS = 10000;

const logChatEvent = (message: string, details?: unknown) => {
	if (!__DEV__) {
		return;
	}

	if (details === undefined) {
		console.log(`[DocumentChat] ${message}`);
		return;
	}

	console.log(`[DocumentChat] ${message}`, details);
};

const DateDivider = memo(function DateDivider({ dateString }: { dateString: string }) {
	return (
		<View className="my-5 items-center justify-center">
			<View className="rounded-full bg-muted/40 px-3.5 py-1.5 border border-border/10">
				<TextComponent className="text-[11px] font-semibold text-muted-foreground">
					{dateString}
				</TextComponent>
			</View>
		</View>
	);
});

const MessageBubble = memo(function MessageBubble({
	isCurrentUser,
	message,
}: {
	isCurrentUser: boolean;
	message: DocumentChatMessage;
}) {
	const isSending = message.status === 'sending';
	const isError = message.status === 'error';

	return (
		<View className={`mb-3 flex-row ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
			<View className="flex-col">
				{!isCurrentUser && (
					<TextComponent className="text-[11px] font-bold text-muted-foreground mb-1 px-1">
						{message.senderName}
					</TextComponent>
				)}
				<View
					className={`px-4 py-2.5 max-w-[280px] shadow-sm ${
						isCurrentUser
							? 'bg-primary rounded-[20px] rounded-br-[4px]'
							: 'bg-card border border-border/60 rounded-[20px] rounded-bl-[4px]'
					}`}
					style={{
						opacity: isSending ? 0.6 : 1,
					}}>
					<TextComponent
						className={`text-sm leading-6 ${
							isCurrentUser ? 'text-primary-foreground' : 'text-foreground'
						}`}>
						{message.text}
					</TextComponent>
					<View className="flex-row items-center justify-end gap-1 mt-1">
						<TextComponent
							className={`text-[9px] ${
								isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
							}`}>
							{format(new Date(message.createdAt), 'h:mm a')}
						</TextComponent>

						{isCurrentUser && (
							<View className="w-3 h-3 items-center justify-center">
								{isSending ? (
									<ActivityIndicator
										size={8}
										color="#FFFFFF"
									/>
								) : isError ? (
									<TextComponent className="text-[9px] text-destructive-foreground font-bold">
										!
									</TextComponent>
								) : (
									<TextComponent className="text-[9px] text-primary-foreground/70">
										✓
									</TextComponent>
								)}
							</View>
						)}
					</View>
				</View>
			</View>
		</View>
	);
});

const DocumentChatModal = memo(function DocumentChatModal({
	currentUser,
	isVisible,
	onClose,
	project,
}: DocumentChatModalProps) {
	const { colors } = useTheme();
	const [messageText, setMessageText] = useState('');
	const [messages, setMessages] = useState<DocumentChatMessage[]>([]);
	const [optimisticMessages, setOptimisticMessages] = useState<DocumentChatMessage[]>([]);
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [chatError, setChatError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);
	const flashListRef = useRef<FlashList<ChatListItem>>(null);

	const chatRoomId = project?._id ?? null;

	const handleChangeMessageText = useCallback((value: string) => {
		setMessageText(value);
	}, []);

	// Local optimistic messages are merged and duplicates are filtered out
	const mergedMessages = useMemo(() => {
		const firebaseTextSet = new Set(messages.map((m) => `${m.senderId}_${m.text}`));
		const filteredOptimistic = optimisticMessages.filter(
			(om) => !firebaseTextSet.has(`${om.senderId}_${om.text}`),
		);
		return [...messages, ...filteredOptimistic].sort((a, b) => a.createdAt - b.createdAt);
	}, [messages, optimisticMessages]);

	// Transform merged messages into heterogeneous list containing date dividers
	const chatItems = useMemo(() => {
		const items: ChatListItem[] = [];
		let lastDateStr = '';
		for (const msg of mergedMessages) {
			const dateStr = format(new Date(msg.createdAt), 'yyyy-MM-dd');
			if (dateStr !== lastDateStr) {
				lastDateStr = dateStr;
				items.push({
					type: 'dateDivider',
					dateString: format(new Date(msg.createdAt), 'MMMM d, yyyy'),
					id: `divider-${msg.id || msg.createdAt}`,
				});
			}
			items.push({
				type: 'message',
				message: msg,
				id: msg.id || `msg-${msg.createdAt}`,
			});
		}
		return items.toReversed();
	}, [mergedMessages]);

	const handleScrollToBottom = useCallback(() => {
		if (chatItems.length > 0) {
			flashListRef.current?.scrollToIndex({ index: 0, animated: true });
		}
	}, [chatItems.length]);

	const handleRetry = useCallback(() => {
		setRetryCount((current) => current + 1);
	}, []);

	useEffect(() => {
		if (!isVisible || !chatRoomId) {
			setMessages([]);
			setOptimisticMessages([]);
			setChatError(null);
			setIsLoadingMessages(false);
			return;
		}

		let loadingTimeout: ReturnType<typeof setTimeout> | undefined;
		let isMounted = true;
		let hasReceivedSnapshot = false;

		setIsLoadingMessages(true);
		setChatError(null);

		logChatEvent('subscribing to room', {
			chatRoomId,
			projectTitle: project?.title,
		});

		loadingTimeout = setTimeout(() => {
			if (hasReceivedSnapshot) {
				return;
			}

			logChatEvent('message listener timeout', { chatRoomId });
			setIsLoadingMessages(false);
			setChatError(
				'Messages are taking too long to load. Check your connection and try again.',
			);
		}, CHAT_LOAD_TIMEOUT_MS);

		const chatRef = ref(firebaseDatabase, `chats/${chatRoomId}`);

		const unsubscribe = onValue(
			chatRef,
			(snapshot) => {
				if (!isMounted) {
					return;
				}

				hasReceivedSnapshot = true;
				if (loadingTimeout) {
					clearTimeout(loadingTimeout);
				}

				const snapshotValue = snapshot.val() as
					| Record<string, FirebaseChatMessageRecord>
					| null;

				if (!snapshotValue) {
					logChatEvent('room loaded with no messages', { chatRoomId });
					setMessages([]);
					setIsLoadingMessages(false);
					setChatError(null);
					return;
				}

				const nextMessages = Object.entries(snapshotValue)
					.map(([id, value]) => ({
						id,
						senderId: value.senderId || '',
						senderName: value.senderName || 'Unknown user',
						text: value.text || '',
						createdAt:
							typeof value.timestamp === 'number' ? value.timestamp : Date.now(),
					}))
					.sort((left, right) => left.createdAt - right.createdAt);

				logChatEvent('messages loaded', {
					chatRoomId,
					count: nextMessages.length,
				});
				setMessages(nextMessages);
				setIsLoadingMessages(false);
				setChatError(null);
			},
			(error) => {
				if (!isMounted) {
					return;
				}

				hasReceivedSnapshot = true;
				if (loadingTimeout) {
					clearTimeout(loadingTimeout);
				}

				const firebaseError = error as Error & { code?: string };
				logChatEvent('message listener failed', {
					chatRoomId,
					code: firebaseError.code,
					message: firebaseError.message,
				});
				setMessages([]);
				setIsLoadingMessages(false);
				setChatError(
					firebaseError.message || 'Unable to load messages right now.',
				);
			},
		);

		return () => {
			isMounted = false;
			if (loadingTimeout) {
				clearTimeout(loadingTimeout);
			}
			logChatEvent('unsubscribing from room', { chatRoomId });
			unsubscribe?.();
		};
	}, [chatRoomId, isVisible, project?.title, retryCount]);

	useEffect(() => {
		if (mergedMessages.length > 0) {
			const lastMessage = mergedMessages[mergedMessages.length - 1];
			const isMyMessage = lastMessage?.senderId === (currentUser?.id || currentUser?._id);
			if (isMyMessage) {
				const timer = setTimeout(() => {
					handleScrollToBottom();
				}, 80);
				return () => clearTimeout(timer);
			}
		}
	}, [handleScrollToBottom, mergedMessages, currentUser?.id, currentUser?._id]);

	const handleClose = useCallback(() => {
		setMessageText('');
		onClose();
	}, [onClose]);

	const handleSendMessage = useCallback(async () => {
		if (!chatRoomId || !currentUser || !project) {
			return;
		}

		const trimmedMessage = messageText.trim();
		if (!trimmedMessage) {
			return;
		}

		const tempId = `temp-${Date.now()}`;
		const newOptimisticMsg: DocumentChatMessage = {
			id: tempId,
			senderId: currentUser.id || currentUser._id,
			senderName: currentUser.name,
			text: trimmedMessage,
			createdAt: Date.now(),
			status: 'sending',
		};

		setOptimisticMessages((current) => [...current, newOptimisticMsg]);
		setMessageText('');

		try {
			const messagesRef = ref(firebaseDatabase, `chats/${chatRoomId}`);
			await push(messagesRef, {
				senderId: currentUser.id || currentUser._id,
				senderName: currentUser.name,
				text: trimmedMessage,
				timestamp: serverTimestamp(),
			});

			logChatEvent('message sent', {
				chatRoomId,
				projectTitle: project.title,
			});

			setOptimisticMessages((current) => current.filter((om) => om.id !== tempId));

			const currentUserId = currentUser.id || currentUser._id;
			const recipientId = currentUserId === project.studentId ? project.assignedAdmin : project.studentId;

			if (recipientId) {
				await sendNotification(
					recipientId,
					currentUser.name,
					`sent a chat message on "${project.title}"`,
				);
			}
		} catch (error) {
			logChatEvent('send failed', error);
			console.error('Failed to send chat message:', error);
			setOptimisticMessages((current) =>
				current.map((om) => (om.id === tempId ? { ...om, status: 'error' } : om)),
			);
		}
	}, [chatRoomId, currentUser, messageText, project]);

	const getItemType = useCallback((item: ChatListItem) => {
		return item.type;
	}, []);

	const keyExtractor = useCallback((item: ChatListItem) => {
		return item.id;
	}, []);

	const renderItem = useCallback(({ item }: { item: ChatListItem }) => {
		if (item.type === 'dateDivider') {
			return <DateDivider dateString={item.dateString} />;
		}

		const isCurrentUser = item.message.senderId === (currentUser?.id || currentUser?._id);
		return (
			<MessageBubble
				message={item.message}
				isCurrentUser={isCurrentUser}
			/>
		);
	}, [currentUser?.id, currentUser?._id]);

	const emptyState = useMemo(() => {
		if (isLoadingMessages) {
			return (
				<View className="flex-1 items-center justify-center py-16">
					<ActivityIndicator
						size="small"
						color={colors.primary}
					/>
				</View>
			);
		}

		if (chatError) {
			return (
				<View className="flex-1 items-center justify-center py-16">
					<TextComponent className="text-base font-semibold text-foreground">
						Unable to load messages
					</TextComponent>
					<TextComponent className="mt-2 max-w-[260px] text-center text-sm leading-6 text-muted-foreground">
						{chatError}
					</TextComponent>
					<Pressable
						onPress={handleRetry}
						className="mt-5 rounded-full bg-primary px-5 py-3 active:opacity-90">
						<TextComponent className="text-sm font-bold text-primary-foreground">
							Retry
						</TextComponent>
					</Pressable>
				</View>
			);
		}

		if (messages.length === 0) {
			return (
				<View className="flex-1 items-center justify-center py-16">
					<TextComponent className="text-base font-semibold text-foreground">
						No messages yet
					</TextComponent>
					<TextComponent className="mt-2 max-w-[240px] text-center text-sm leading-6 text-muted-foreground">
						Start the conversation about this document and new messages will
						appear live here.
					</TextComponent>
				</View>
			);
		}

		return null;
	}, [chatError, colors.primary, handleRetry, isLoadingMessages, messages.length]);

	return (
		<Modal
			isVisible={isVisible}
			onBackdropPress={handleClose}
			onBackButtonPress={handleClose}
			style={{ margin: 0, justifyContent: 'flex-end' }}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				className="h-[85%] overflow-hidden rounded-t-[32px] border border-border bg-background">
				<View className="items-center pb-2 pt-4">
					<View className="h-1.5 w-12 rounded-full bg-muted" />
				</View>

				<View className="border-b border-border px-5 pb-4 pt-2">
					<View className="flex-row items-start justify-between gap-3">
						<View className="flex-1">
							<TextComponent className="text-2xl font-extrabold text-foreground">
								Document chat
							</TextComponent>
							<TextComponent
								className="mt-1 text-sm leading-6 text-muted-foreground"
								numberOfLines={2}>
								{project?.title}
							</TextComponent>
						</View>
						<Pressable
							onPress={handleClose}
							className="min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border bg-card">
							<CloseIcon
								size={18}
								color={colors.foreground}
							/>
						</Pressable>
					</View>
				</View>

				<View className="flex-1 px-5 py-4">
					{chatItems.length === 0 ? (
						emptyState
					) : (
						<FlashList
							ref={flashListRef}
							data={chatItems}
							renderItem={renderItem}
							keyExtractor={keyExtractor}
							getItemType={getItemType}
							estimatedItemSize={84}
							inverted
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{ paddingBottom: 12 }}
						/>
					)}
				</View>

				<View className="border-t border-border px-5 pb-6 pt-4">
					<View className="flex-row items-end gap-3">
						<View className="flex-1 rounded-[24px] border border-border bg-card px-4 py-1">
							<TextInput
								value={messageText}
								onChangeText={handleChangeMessageText}
								placeholder="Write a message about this document"
								placeholderTextColor={colors.mutedForeground}
								className="min-h-[48px] max-h-[120px] py-3 text-base text-foreground"
								multiline
								textAlignVertical="top"
							/>
						</View>

						<Pressable
							onPress={handleSendMessage}
							disabled={!messageText.trim()}
							className="h-12 w-12 items-center justify-center rounded-full bg-primary active:opacity-90"
							style={{ opacity: !messageText.trim() ? 0.5 : 1 }}>
							<SendIcon
								size={18}
								color={colors.primaryForeground}
							/>
						</Pressable>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
});

export default DocumentChatModal;
