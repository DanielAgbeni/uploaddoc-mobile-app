import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
	size?: number;
	color?: string;
}

const UsersIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
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
			<Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
			<Circle
				cx="9"
				cy="7"
				r="4"
			/>
			<Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
			<Path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</Svg>
	);
};

export default UsersIcon;
