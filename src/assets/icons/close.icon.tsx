import React, { memo } from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
	size?: number;
	color?: string;
}

const CloseIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none">
			<Path
				d="M18 6L6 18"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M6 6l12 12"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
};

export default memo(CloseIcon);
