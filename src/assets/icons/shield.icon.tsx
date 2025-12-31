import React, { memo } from 'react';
import { Path, Svg } from 'react-native-svg';

const ShieldIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 24,
	color,
}) => {
	const iconColor = color || '#000000';

	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 -960 960 960"
			fill="none">
			<Path
				d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z"
				fill={iconColor}
			/>
		</Svg>
	);
};

export default memo(ShieldIcon);
