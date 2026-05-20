import { getApp, getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
	apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
	appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
	authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
	messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const firebaseApp =
	getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseDatabase = getDatabase(firebaseApp);
