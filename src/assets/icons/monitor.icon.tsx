import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface IconProps {
	size?: number;
	color?: string;
}

const MonitorIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none">
			<Rect
				x={2}
				y={3}
				width={20}
				height={14}
				rx={2}
				ry={2}
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M8 21h8M12 17v4"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
};

export default MonitorIcon;
