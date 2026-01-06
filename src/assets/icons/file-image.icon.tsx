import React, { memo } from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface IconProps {
	size?: number;
	color?: string;
}

const FileImageIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none">
			<Rect
				x={3}
				y={3}
				width={18}
				height={18}
				rx={2}
				ry={2}
				stroke={color}
				strokeWidth={2}
			/>
			<Circle
				cx={8.5}
				cy={8.5}
				r={1.5}
				fill={color}
			/>
			<Path
				d="M21 15l-5-5L5 21"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
};

export default memo(FileImageIcon);
