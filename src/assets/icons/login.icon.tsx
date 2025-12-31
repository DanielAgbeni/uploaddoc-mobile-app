import React, { memo } from 'react';
import { Path, Svg } from 'react-native-svg';

const LoginIcon: React.FC<{ size?: number; color?: string }> = ({
	size = 16,
	color,
}) => {
	if (!color) {
		color = '#000000';
	}
	return (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 16 16"
			fill={color}>
			<Path d="M480.67-120v-66.67h292.66v-586.66H480.67V-840h292.66q27 0 46.84 19.83Q840-800.33 840-773.33v586.66q0 27-19.83 46.84Q800.33-120 773.33-120H480.67Zm-63.34-176.67-47-48 102-102H120v-66.66h351l-102-102 47-48 184 184-182.67 182.66Z" />
		</Svg>
	);
};

export default memo(LoginIcon);
