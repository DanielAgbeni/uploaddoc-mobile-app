import React, { memo } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface IconProps {
	size?: number;
	color?: string;
}

const FilePdfIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none">
			<Path
				d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M14 2v6h6"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M10 13H8v4h1v-1.5h1a1.5 1.5 0 0 0 0-3z"
				fill={color}
			/>
			<Path
				d="M13 13h1.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5H13v-4z"
				fill={color}
			/>
		</Svg>
	);
};

export default memo(FilePdfIcon);
