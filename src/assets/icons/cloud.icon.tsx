import React from 'react';
import Svg, { Path } from 'react-native-svg';

type IconProps = {
	size?: number;
	color?: string;
};

const CloudIcon = ({ size = 24, color = '#000000' }: IconProps) => (
	<Svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round">
		<Path d="M17.5 19c0-1.7-1.3-3-3-3h-1.1c-.1-1.2-.6-2.3-1.5-3.1-.9-.9-2-1.4-3.2-1.4-2.5 0-4.6 1.8-5 4.2C1.5 16.2 1 17.5 1 19c0 2.8 2.2 5 5 5h11.5c2.5 0 4.5-2 4.5-4.5S20 15 17.5 15v4z" />
	</Svg>
);

export default CloudIcon;
