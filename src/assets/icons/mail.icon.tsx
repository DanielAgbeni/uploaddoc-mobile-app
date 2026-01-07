import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface IconProps {
	size?: number;
	color?: string;
}

const MailIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round">
			<Rect
				x="2"
				y="4"
				width="20"
				height="16"
				rx="2"
			/>
			<Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
		</Svg>
	);
};

export default MailIcon;
