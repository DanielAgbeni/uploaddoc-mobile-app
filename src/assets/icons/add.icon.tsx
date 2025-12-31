import React, { memo } from 'react';
import { Svg, Path } from 'react-native-svg';

type IconProps = {
	size?: number;
	color?: string;
};

const AddIcon: React.FC<IconProps> = ({ size = 24, color = '#e3e3e3' }) => {
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 -960 960 960"
			fill="none">
			<Path
				d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"
				fill={color}
			/>
		</Svg>
	);
};

export default memo(AddIcon);
