import { useTheme } from '../providers/ThemeProvider';
import { getColorsForScheme, type ThemeColors } from './colors';

/**
 * Hook to get the current theme colors based on the active color scheme.
 *
 * Use this hook when you need programmatic access to colors, such as:
 * - Icon colors
 * - LinearGradient colors
 * - Dynamic styles
 * - React Native Paper or other library themes
 *
 * For Tailwind/NativeWind classes, use the CSS variable classes directly
 * (e.g., `bg-primary`, `text-foreground`).
 *
 * @example
 * ```tsx
 * const colors = useColors();
 *
 * // Use in LinearGradient
 * <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} />
 *
 * // Use for icon color
 * <Icon color={colors.primary} />
 * ```
 */
export function useColors(): ThemeColors {
	const { colorScheme } = useTheme();
	return getColorsForScheme(colorScheme);
}
