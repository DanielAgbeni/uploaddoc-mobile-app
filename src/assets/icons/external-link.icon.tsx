import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
	size?: number;
	color?: string;
}

const ExternalLinkIcon: React.FC<IconProps> = ({
	size = 24,
	color = '#000',
}) => {
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none">
			<Path
				d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
				stroke={color}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
};

export default ExternalLinkIcon;
