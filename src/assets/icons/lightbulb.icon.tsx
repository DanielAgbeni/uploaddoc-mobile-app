import React, { memo } from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
	size?: number;
	color?: string;
}

const LightbulbIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none">
			<Path
				d="M9 18h6"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M10 22h4"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M12 2a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2z"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
};

export default memo(LightbulbIcon);
