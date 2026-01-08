import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

type IconProps = {
	size?: number;
	color?: string;
};

const CoinsIcon = ({ size = 24, color = '#000000' }: IconProps) => (
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
			cx="8"
			cy="8"
			r="6"
		/>
		<Path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
		<Path d="M7 6h1v4" />
		<Path d="m16.71 13.88.7 .71-2.82 2.82" />
	</Svg>
);

export default CoinsIcon;
