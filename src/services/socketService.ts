import { io, Socket } from 'socket.io-client';

const BACKEND_URL = 'https://api.uploaddoc.app';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
	if (socket?.connected) {
		return socket;
	}

	// Disconnect stale instance if exists
	if (socket) {
		socket.disconnect();
	}

	socket = io(BACKEND_URL, {
		auth: { token },
		transports: ['websocket'],
		reconnection: true,
		reconnectionAttempts: 10,
		reconnectionDelay: 2000,
	});

	socket.on('connect', () => {
		console.log('[SocketService] Connected:', socket?.id);
	});

	socket.on('connect_error', (error: any) => {
		console.warn('[SocketService] Connection error message:', error.message);
		console.warn('[SocketService] Connection error keys:', Object.keys(error));
		if (error.description) {
			console.warn('[SocketService] Connection description:', error.description);
			if (typeof error.description === 'object') {
				try {
					console.warn('[SocketService] Connection description details:', JSON.stringify(error.description));
				} catch (e) {
					console.warn('[SocketService] Connection description keys:', Object.keys(error.description));
				}
			}
		}
		if (error.context) {
			console.warn('[SocketService] Connection error context:', error.context);
		}
	});

	socket.on('disconnect', (reason) => {
		console.log('[SocketService] Disconnected:', reason);
	});

	return socket;
}

export function disconnectSocket(): void {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}

export function getSocket(): Socket | null {
	return socket;
}
