import React from 'react';
import {
	Text as RNText,
	TextProps as RNTextProps,
	StyleSheet,
} from 'react-native';

/**
 * Text variant types for easy styling
 */
export type TextVariant =
	| 'h1'
	| 'h2'
	| 'h3'
	| 'body'
	| 'bodyMedium'
	| 'bodySemibold'
	| 'bodyBold'
	| 'caption'
	| 'label';

interface AppTextProps extends RNTextProps {
	/**
	 * Predefined text variant for quick styling
	 */
	variant?: TextVariant;
	/**
	 * Children content
	 */
	children: React.ReactNode;
}

/**
 * Custom Text component with default font styling.
 *
 * All text in the app should use this component to ensure consistent typography.
 *
 * @example
 * // Basic usage (defaults to 'body' variant with medium font)
 * <AppText>Hello World</AppText>
 *
 * @example
 * // With variant
 * <AppText variant="h1">Heading</AppText>
 *
 * @example
 * // With NativeWind classes (can override defaults)
 * <AppText className="text-primary font-bold">Styled Text</AppText>
 */
export const TextComponent: React.FC<AppTextProps> = ({
	variant = 'body',
	style,
	className = '',
	children,
	...props
}) => {
	// Get the variant class name
	const variantClassName = variantStyles[variant] || variantStyles.body;

	// Combine variant classes with any additional classes
	// User-provided className comes last to allow overrides
	const combinedClassName = `${variantClassName} ${className}`.trim();

	return (
		<RNText
			className={combinedClassName}
			style={style}
			{...props}>
			{children}
		</RNText>
	);
};

/**
 * Variant class names using NativeWind/Tailwind classes
 *
 * - Default font-weight is 'medium' (font-medium)
 * - Default text color is 'foreground' (text-foreground)
 */
const variantStyles: Record<TextVariant, string> = {
	// Headings
	h1: 'text-3xl font-bold text-foreground',
	h2: 'text-2xl font-bold text-foreground',
	h3: 'text-xl font-semibold text-foreground',

	// Body text
	body: 'text-base font-medium text-foreground',
	bodyMedium: 'text-base font-medium text-foreground',
	bodySemibold: 'text-base font-semibold text-foreground',
	bodyBold: 'text-base font-bold text-foreground',

	// Small text
	caption: 'text-xs font-medium text-muted-foreground',
	label: 'text-sm font-medium text-muted-foreground',
};

export default TextComponent;
