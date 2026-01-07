import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
	size?: number;
	color?: string;
}

const ClockIcon: React.FC<IconProps> = ({ size = 24, color = '#000' }) => {
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
			<Circle
				cx="12"
				cy="12"
				r="10"
			/>
			<Path d="M12 6v6l4 2" />
		</Svg>
	);
};

export default ClockIcon;
