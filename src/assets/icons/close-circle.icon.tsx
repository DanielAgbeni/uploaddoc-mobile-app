import React, { memo } from 'react';
import { Svg, Path } from 'react-native-svg';

type IconProps = {
	size?: number;
	color?: string;
};

const CloseCircleIcon: React.FC<IconProps> = ({
	size = 24,
	color = '#e3e3e3',
}) => {
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 -960 960 960"
			fill="none">
			<Path
				d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm-80-176 80-80 80 80 56-56-80-80 80-80-56-56-80 80-80-80-56 56 80 80-80 80 56 56ZM480-480Z"
				fill={color}
			/>
		</Svg>
	);
};

export default memo(CloseCircleIcon);
