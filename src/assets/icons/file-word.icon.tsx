import React, { memo } from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
	size?: number;
	color?: string;
}

const FileWordIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
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
				d="M8 13l1.5 4 1.5-4 1.5 4 1.5-4"
				stroke={color}
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
};

export default memo(FileWordIcon);
