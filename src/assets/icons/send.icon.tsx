import React, { memo } from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
	size?: number;
	color?: string;
}

const SendIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none">
			<Path
				d="M22 2L11 13"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M22 2L15 22L11 13L2 9L22 2Z"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
};

export default memo(SendIcon);
