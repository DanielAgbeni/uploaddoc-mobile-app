import React from 'react';
import { View, ScrollView, ViewStyle, ScrollViewProps } from 'react-native';

interface MainContainerProps {
  /**
   * Children components to render inside the container
   */
  children: React.ReactNode;
  
  /**
   * Whether to use ScrollView (default) or regular View
   * @default true
   */
  scrollable?: boolean;
  
  /**
   * Additional className for custom styling
   */
  className?: string;
  
  /**
   * Whether to add default padding
   * @default true
   */
  withPadding?: boolean;
  
  /**
   * Whether to center content vertically
   * @default false
   */
  centerContent?: boolean;
  
  /**
   * Additional ScrollView props (only used when scrollable=true)
   */
  scrollViewProps?: Partial<ScrollViewProps>;
  
  /**
   * Additional style object
   */
  style?: ViewStyle;
}

/**
 * MainContainer - A consistent container component used across all screens
 * 
 * This component provides a standardized layout wrapper with:
 * - Consistent background color (theme-aware)
 * - Optional scrolling capability
 * - Configurable padding
 * - Flexible content alignment
 * 
 * @example
 * ```tsx
 * // Basic usage with scrolling
 * <MainContainer>
 *   <Text>Your content here</Text>
 * </MainContainer>
 * 
 * // Without scrolling
 * <MainContainer scrollable={false}>
 *   <Text>Static content</Text>
 * </MainContainer>
 * 
 * // Centered content without padding
 * <MainContainer centerContent withPadding={false}>
 *   <Text>Centered content</Text>
 * </MainContainer>
 * 
 * // Custom styling
 * <MainContainer className="bg-primary">
 *   <Text>Custom background</Text>
 * </MainContainer>
 * ```
 */
export default function MainContainer({
  children,
  scrollable = true,
  className = '',
  withPadding = true,
  centerContent = false,
  scrollViewProps,
  style,
}: MainContainerProps) {
  // Build the className string
  const baseClasses = 'flex-1 bg-background';
  const paddingClasses = withPadding ? 'p-6' : '';
  const centerClasses = centerContent ? 'justify-center' : '';
  const combinedClassName = `${baseClasses} ${paddingClasses} ${centerClasses} ${className}`.trim();

  if (scrollable) {
    return (
      <ScrollView
        className={combinedClassName}
        style={style}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View className={combinedClassName} style={style}>
      {children}
    </View>
  );
}
