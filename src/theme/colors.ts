/**
 * Centralized color constants for the UploadDoc app.
 * These colors are used throughout the app for theming.
 *
 * Usage:
 * - For NativeWind/Tailwind: Use CSS variable classes (e.g., `bg-primary`, `text-foreground`)
 * - For programmatic access: Use the `useColors()` hook from `@/theme`
 */

// Theme color interface
export interface ThemeColors {
	// Brand colors
	primary: string;
	secondary: string;
	accent: string;

	// Semantic colors
	background: string;
	foreground: string;
	card: string;
	cardForeground: string;
	popover: string;
	popoverForeground: string;
	primaryForeground: string;
	secondaryForeground: string;
	muted: string;
	mutedForeground: string;
	accentForeground: string;
	destructive: string;
	destructiveForeground: string;
	border: string;
	input: string;
	ring: string;

	// Gradient colors for buttons
	gradientStart: string;
	gradientEnd: string;
}

// Brand colors provided
export const lightColors: ThemeColors = {
	// Brand colors
	primary: '#444ebb', // Main brand blue
	secondary: '#7d86e8', // Lighter blue accent
	accent: '#5461e8', // Mid-tone blue highlight

	// Semantic colors
	background: '#ebf4ff',
	foreground: '#030407',
	card: '#ebf4ff',
	cardForeground: '#030407',
	popover: '#ebf4ff',
	popoverForeground: '#030407',
	primaryForeground: '#f8f9fc',
	secondaryForeground: '#030407',
	muted: '#ddeaff',
	mutedForeground: '#444ebb',
	accentForeground: '#f8f9fc',
	destructive: '#dc2626',
	destructiveForeground: '#f8f9fc',
	border: '#c8dfff',
	input: '#c8dfff',
	ring: '#444ebb',

	// Gradient colors for buttons
	gradientStart: '#444ebb',
	gradientEnd: '#5461e8',
};

export const darkColors: ThemeColors = {
	// Brand colors
	primary: '#444ebb', // Same as light
	secondary: '#172082', // Deep navy blue
	accent: '#1724ab', // Rich royal blue

	// Semantic colors
	background: '#000914',
	foreground: '#f8f9fc',
	card: '#000f24',
	cardForeground: '#f8f9fc',
	popover: '#000f24',
	popoverForeground: '#f8f9fc',
	primaryForeground: '#f8f9fc',
	secondaryForeground: '#f8f9fc',
	muted: '#172082',
	mutedForeground: '#c8dfff',
	accentForeground: '#f8f9fc',
	destructive: '#ef4444',
	destructiveForeground: '#f8f9fc',
	border: 'rgba(255, 255, 255, 0.1)',
	input: 'rgba(255, 255, 255, 0.15)',
	ring: '#444ebb',

	// Gradient colors for buttons
	gradientStart: '#444ebb',
	gradientEnd: '#1724ab',
};

// Type exports
export type ColorScheme = 'light' | 'dark';
export type ColorKey = keyof ThemeColors;

/**
 * Get colors for a specific color scheme
 */
export function getColorsForScheme(scheme: ColorScheme): ThemeColors {
	return scheme === 'dark' ? darkColors : lightColors;
}
