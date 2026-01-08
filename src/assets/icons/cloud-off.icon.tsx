import React from 'react';
import Svg, { Path } from 'react-native-svg';

type IconProps = {
	size?: number;
	color?: string;
};

const CloudOffIcon = ({ size = 24, color = '#000000' }: IconProps) => (
	<Svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round">
		<Path d="M4 4l16 16" />
		<Path d="M5.7 5.7C2.8 7.6 1 10.8 1 14.5c0 2.8 2.2 5 5 5h11.5c.9 0 1.7-.2 2.4-.6" />
		<Path d="M17.5 19c0-1.7-1.3-3-3-3h-1.1" />
		<Path d="M22.6 17.4c.3-.8 .4-1.6 .4-2.4 0-2.5-2-4.5-4.5-4.5-.6 0-1.1.1-1.6.3" />
		<Path d="M13 11.5c-.1-1.2-.6-2.3-1.5-3.1-.9-.9-2-1.4-3.2-1.4-2.5 0-4.6 1.8-5 4.2" />
	</Svg>
);

export default CloudOffIcon;
