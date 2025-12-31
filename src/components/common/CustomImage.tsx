import React, { forwardRef, memo } from 'react';
import { Image, ImageProps } from 'expo-image';
import { cssInterop } from 'nativewind';
import {
	DarkThemeDefaultImage,
	LightThemeDefaultImage,
} from '../../assets/images';
import { useTheme } from '../../providers/ThemeProvider';
import { cn } from '../../utils/class-names';

// Enable className support for expo-image
cssInterop(Image, { className: 'style' });

type TCustomImageProps = ImageProps & {
	imageClassName?: string;
	className?: string;
};

const CustomImage = forwardRef<Image, TCustomImageProps>(
	(
		{
			source,
			className,
			imageClassName,
			style,
			contentFit = 'cover',
			placeholder,
			transition = 200,
			...props
		},
		ref,
	) => {
		const { colorScheme } = useTheme();

		const defaultImage =
			colorScheme === 'light' ? LightThemeDefaultImage : DarkThemeDefaultImage;

		const imageSource = source ?? defaultImage;
		const imagePlaceholder = source
			? (placeholder ?? defaultImage)
			: placeholder;

		return (
			<Image
				ref={ref}
				source={imageSource}
				placeholder={imagePlaceholder}
				contentFit={contentFit}
				transition={transition}
				className={cn(className, imageClassName)}
				style={style}
				{...props}
			/>
		);
	},
);

CustomImage.displayName = 'CustomImage';

export default memo(CustomImage);
