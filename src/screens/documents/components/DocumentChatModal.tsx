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
	ScrollView,
	TextInput,
	View,
} from 'react-native';
import Modal from 'react-native-modal';
import { format } from 'date-fns';
import { onValue, push, ref, serverTimestamp } from 'firebase/database';
import { CloseIcon } from '../../../assets/icons';
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

const MessageBubble = memo(function MessageBubble({
	isCurrentUser,
	message,
}: {
	isCurrentUser: boolean;
	message: DocumentChatMessage;
}) {
	return (
		<View className={`mb-3 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
			<View
				className={`max-w-[82%] rounded-[24px] px-4 py-3 ${
					isCurrentUser ? 'bg-primary' : 'border border-border bg-card'
				}`}>
				<TextComponent
					className={`text-xs font-semibold ${
						isCurrentUser ? 'text-primary-foreground/80' : 'text-muted-foreground'
					}`}>
					{message.senderName}
				</TextComponent>
				<TextComponent
					className={`mt-1 text-sm leading-6 ${
						isCurrentUser ? 'text-primary-foreground' : 'text-foreground'
					}`}>
					{message.text}
				</TextComponent>
			</View>
			<TextComponent className="mt-1 px-1 text-xs text-muted-foreground">
				{format(new Date(message.createdAt), 'MMM d, h:mm a')}
			</TextComponent>
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
	const [isLoadingMessages, setIsLoadingMessages] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [chatError, setChatError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);
	const scrollViewRef = useRef<ScrollView>(null);

	const chatRoomId = project?._id ?? null;

	const handleChangeMessageText = useCallback((value: string) => {
		setMessageText(value);
	}, []);

	const handleScrollToBottom = useCallback(() => {
		scrollViewRef.current?.scrollToEnd({ animated: true });
	}, []);

	const handleRetry = useCallback(() => {
		setRetryCount((current) => current + 1);
	}, []);

	useEffect(() => {
		if (!isVisible || !chatRoomId) {
			setMessages([]);
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
		if (messages.length > 0) {
			const timer = setTimeout(() => {
				handleScrollToBottom();
			}, 80);

			return () => clearTimeout(timer);
		}
	}, [handleScrollToBottom, messages]);

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

		setIsSending(true);

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
			setMessageText('');

			if (project.assignedAdmin) {
				await sendNotification(
					project.assignedAdmin,
					currentUser.name,
					`sent a chat message on "${project.title}"`,
				);
			}
		} catch (error) {
			logChatEvent('send failed', error);
			console.error('Failed to send chat message:', error);
		} finally {
			setIsSending(false);
		}
	}, [chatRoomId, currentUser, messageText, project]);

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
					<ScrollView
						ref={scrollViewRef}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ flexGrow: 1, paddingBottom: 12 }}>
						{messages.length === 0 ? emptyState : null}
						{messages.map((message) => (
							<MessageBubble
								key={message.id}
								message={message}
								isCurrentUser={
									message.senderId === (currentUser?.id || currentUser?._id)
								}
							/>
						))}
					</ScrollView>
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
							disabled={isSending || !messageText.trim()}
							className="min-h-[48px] rounded-full bg-primary px-5 py-3 active:opacity-90"
							style={{ opacity: isSending || !messageText.trim() ? 0.5 : 1 }}>
							{isSending ? (
								<ActivityIndicator
									size="small"
									color="#FFFFFF"
								/>
							) : (
								<TextComponent className="text-sm font-bold text-primary-foreground">
									Send
								</TextComponent>
							)}
						</Pressable>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
});

export default DocumentChatModal;
