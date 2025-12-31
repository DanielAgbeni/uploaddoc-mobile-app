import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../utils/storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
	theme: Theme;
	colorScheme: 'light' | 'dark';
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
	const systemColorScheme = useColorScheme() ?? 'light';
	const [theme, setThemeState] = useState<Theme>('system');

	// Load theme preference from storage on mount
	useEffect(() => {
		const savedTheme = storage.getString(THEME_STORAGE_KEY);
		if (
			savedTheme === 'light' ||
			savedTheme === 'dark' ||
			savedTheme === 'system'
		) {
			setThemeState(savedTheme);
		}
	}, []);

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
		storage.set(THEME_STORAGE_KEY, newTheme);
	};

	const toggleTheme = () => {
		const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
		setTheme(newTheme);
	};

	// Determine the actual color scheme to use
	const colorScheme: 'light' | 'dark' =
		theme === 'system' ? systemColorScheme : theme;

	return (
		<ThemeContext.Provider
			value={{ theme, colorScheme, setTheme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
