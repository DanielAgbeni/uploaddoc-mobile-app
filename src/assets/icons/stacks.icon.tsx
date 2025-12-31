import React, { memo } from 'react';
import { Path, Svg } from 'react-native-svg';

const StacksIcon: React.FC<{ size?: number; color?: string }> = ({
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
				d="M480-400 40-640l440-240 440 240-440 240Zm0 160L63-467l84-46 333 182 333-182 84 46-417 227Zm0 160L63-307l84-46 333 182 333-182 84 46L480-80Zm0-411 273-149-273-149-273 149 273 149Zm0-149Z"
				fill={iconColor}
			/>
		</Svg>
	);
};

export default memo(StacksIcon);
