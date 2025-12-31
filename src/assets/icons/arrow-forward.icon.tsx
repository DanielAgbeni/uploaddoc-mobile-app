import React, { memo } from 'react';
import { Path, Svg } from 'react-native-svg';

const ArrowForwardIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 24,
	color,
}) => {
	const iconColor = color || '#000000';

	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 -960 960 960"
			fill="none">
			<Path
				d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"
				fill={iconColor}
			/>
		</Svg>
	);
};

export default memo(ArrowForwardIcon);
