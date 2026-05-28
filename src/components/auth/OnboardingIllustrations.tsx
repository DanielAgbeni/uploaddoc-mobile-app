import React, { memo } from 'react';
import { View } from 'react-native';
import Svg, {
	Path,
	Circle,
	Rect,
	Defs,
	LinearGradient,
	Stop,
	G,
	Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../../providers/ThemeProvider';

export const UploadIllustration = memo(function UploadIllustration({ size = 280 }: { size?: number }) {
	const { colors } = useTheme();

	return (
		<View className="items-center justify-center">
			<Svg
				width={size}
				height={size}
				viewBox="0 0 200 200">
				<Defs>
					<LinearGradient
						id="phoneGrad"
						x1="0"
						y1="0"
						x2="0"
						y2="1">
						<Stop
							offset="0%"
							stopColor={colors.primary}
							stopOpacity={0.08}
						/>
						<Stop
							offset="100%"
							stopColor={colors.primary}
							stopOpacity={0.01}
						/>
					</LinearGradient>
					<LinearGradient
						id="cloudGrad"
						x1="0"
						y1="0"
						x2="0"
						y2="1">
						<Stop
							offset="0%"
							stopColor="#5461e8"
							stopOpacity={0.2}
						/>
						<Stop
							offset="100%"
							stopColor={colors.primary}
							stopOpacity={0.05}
						/>
					</LinearGradient>
					<LinearGradient
						id="docGrad"
						x1="0"
						y1="0"
						x2="1"
						y2="1">
						<Stop
							offset="0%"
							stopColor="#7d86e8"
							stopOpacity={0.4}
						/>
						<Stop
							offset="100%"
							stopColor={colors.primary}
							stopOpacity={0.1}
						/>
					</LinearGradient>
				</Defs>

				{/* Outer Phone Border mockup */}
				<Rect
					x="45"
					y="15"
					width="110"
					height="170"
					rx="18"
					fill="url(#phoneGrad)"
					stroke={colors.border}
					strokeWidth="2"
				/>

				{/* Phone notch */}
				<Rect
					x="80"
					y="15"
					width="40"
					height="8"
					rx="4"
					fill={colors.border}
				/>

				{/* Grid lines inside mockup */}
				<LineMockup
					y={40}
					w={70}
					color={colors.border}
				/>
				<LineMockup
					y={52}
					w={50}
					color={colors.border}
				/>

				{/* Styled Cloud */}
				<Path
					d="M 65 125 A 18 18 0 0 1 80 95 A 25 25 0 0 1 125 90 A 20 20 0 0 1 140 125 Z"
					fill="url(#cloudGrad)"
					stroke="#5461e8"
					strokeWidth="2.5"
				/>

				{/* Document card lifting up */}
				<G transform="translate(70, 75) rotate(-8)">
					<Rect
						x="0"
						y="0"
						width="35"
						height="45"
						rx="6"
						fill="url(#docGrad)"
						stroke={colors.primary}
						strokeWidth="1.5"
					/>
					{/* Doc details mock lines */}
					<Rect
						x="6"
						y="8"
						width="23"
						height="3"
						rx="1.5"
						fill={colors.primary}
						opacity={0.6}
					/>
					<Rect
						x="6"
						y="16"
						width="18"
						height="3"
						rx="1.5"
						fill={colors.primary}
						opacity={0.4}
					/>
					<Rect
						x="6"
						y="24"
						width="23"
						height="3"
						rx="1.5"
						fill={colors.primary}
						opacity={0.4}
					/>
				</G>

				{/* Secondary document card stacked slightly behind */}
				<G transform="translate(102, 85) rotate(12)">
					<Rect
						x="0"
						y="0"
						width="30"
						height="40"
						rx="6"
						fill="url(#docGrad)"
						stroke={colors.primary}
						strokeWidth="1.2"
						opacity={0.7}
					/>
					<Rect
						x="5"
						y="8"
						width="20"
						height="2.5"
						rx="1"
						fill={colors.primary}
						opacity={0.5}
					/>
					<Rect
						x="5"
						y="15"
						width="14"
						height="2.5"
						rx="1"
						fill={colors.primary}
						opacity={0.3}
					/>
				</G>

				{/* Dashed Upload Path arrow */}
				<Path
					d="M 100 160 L 100 132"
					stroke={colors.primary}
					strokeWidth="2.5"
					strokeDasharray="4 4"
				/>
				<Path
					d="M 94 138 L 100 131 L 106 138"
					stroke={colors.primary}
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</Svg>
		</View>
	);
});

export const ConnectIllustration = memo(function ConnectIllustration({ size = 280 }: { size?: number }) {
	const { colors } = useTheme();

	return (
		<View className="items-center justify-center">
			<Svg
				width={size}
				height={size}
				viewBox="0 0 200 200">
				<Defs>
					<LinearGradient
						id="nodeGrad"
						x1="0"
						y1="0"
						x2="1"
						y2="1">
						<Stop
							offset="0%"
							stopColor="#5461e8"
						/>
						<Stop
							offset="100%"
							stopColor={colors.primary}
						/>
					</LinearGradient>
				</Defs>

				{/* Connector Lines radiating from center (100, 100) */}
				<Path
					d="M 100 100 L 45 60"
					stroke={colors.primary}
					strokeWidth="1.5"
					strokeDasharray="3 3"
					opacity={0.7}
				/>
				<Path
					d="M 100 100 L 155 60"
					stroke={colors.primary}
					strokeWidth="1.5"
					strokeDasharray="3 3"
					opacity={0.7}
				/>
				<Path
					d="M 100 100 L 45 140"
					stroke={colors.primary}
					strokeWidth="1.5"
					strokeDasharray="3 3"
					opacity={0.7}
				/>
				<Path
					d="M 100 100 L 155 140"
					stroke={colors.primary}
					strokeWidth="1.5"
					strokeDasharray="3 3"
					opacity={0.7}
				/>

				{/* Outer receiver node 1: School/Dept (Top Left) */}
				<Circle
					cx="45"
					cy="60"
					r="22"
					fill={colors.card}
					stroke={colors.border}
					strokeWidth="1.5"
				/>
				{/* Draw tiny columns representing school */}
				<Path
					d="M 37 68 L 53 68 M 40 56 L 40 68 M 45 56 L 45 68 M 50 56 L 50 68 M 37 56 L 53 56 M 45 49 L 36 56 L 54 56 Z"
					stroke={colors.primary}
					strokeWidth="1.5"
					fill="none"
				/>

				{/* Outer receiver node 2: Lecturer (Top Right) */}
				<Circle
					cx="155"
					cy="60"
					r="22"
					fill={colors.card}
					stroke={colors.border}
					strokeWidth="1.5"
				/>
				{/* Draw tiny graduation cap */}
				<Path
					d="M 143 57 L 155 51 L 167 57 L 155 63 Z M 148 60 L 148 67 C 148 70, 162 70, 162 67 L 162 60 M 165 58 L 169 66"
					stroke={colors.primary}
					strokeWidth="1.5"
					fill="none"
				/>

				{/* Outer receiver node 3: Office/HR (Bottom Left) */}
				<Circle
					cx="45"
					cy="140"
					r="22"
					fill={colors.card}
					stroke={colors.border}
					strokeWidth="1.5"
				/>
				{/* Draw briefcase */}
				<Rect
					x="36"
					y="132"
					width="18"
					height="13"
					rx="2"
					stroke={colors.primary}
					strokeWidth="1.5"
					fill="none"
				/>
				<Path
					d="M 41 132 L 41 129 C 41 128, 49 128, 49 129 L 49 132"
					stroke={colors.primary}
					strokeWidth="1.5"
					fill="none"
				/>

				{/* Outer receiver node 4: Print Shop (Bottom Right) */}
				<Circle
					cx="155"
					cy="140"
					r="22"
					fill={colors.card}
					stroke={colors.border}
					strokeWidth="1.5"
				/>
				{/* Draw printer */}
				<Path
					d="M 146 138 L 164 138 M 143 146 L 167 146 L 167 138 L 143 138 Z M 148 138 L 148 132 L 162 132 L 162 138"
					stroke={colors.primary}
					strokeWidth="1.5"
					fill="none"
				/>

				{/* Central Sender Node */}
				<Circle
					cx="100"
					cy="100"
					r="28"
					fill={colors.primary}
					opacity={0.1}
				/>
				<Circle
					cx="100"
					cy="100"
					r="20"
					fill="url(#nodeGrad)"
					stroke={colors.background}
					strokeWidth="3"
				/>
				{/* Inner user symbol */}
				<Circle
					cx="100"
					cy="96"
					r="5"
					fill="white"
				/>
				<Path
					d="M 92 107 C 92 102, 108 102, 108 107"
					stroke="white"
					strokeWidth="2.2"
					strokeLinecap="round"
				/>
			</Svg>
		</View>
	);
});

export const TrackIllustration = memo(function TrackIllustration({ size = 280 }: { size?: number }) {
	const { colors } = useTheme();

	return (
		<View className="items-center justify-center">
			<Svg
				width={size}
				height={size}
				viewBox="0 0 200 200">
				<Defs>
					<LinearGradient
						id="trackBg"
						x1="0"
						y1="0"
						x2="0"
						y2="1">
						<Stop
							offset="0%"
							stopColor={colors.card}
							stopOpacity={1}
						/>
						<Stop
							offset="100%"
							stopColor={colors.card}
							stopOpacity={0.8}
						/>
					</LinearGradient>
				</Defs>

				{/* Device Mockup Background */}
				<Rect
					x="25"
					y="20"
					width="150"
					height="160"
					rx="14"
					fill="url(#trackBg)"
					stroke={colors.border}
					strokeWidth="1.5"
				/>

				{/* Mock Header */}
				<Rect
					x="35"
					y="32"
					width="60"
					height="8"
					rx="4"
					fill={colors.primary}
					opacity={0.3}
				/>

				{/* Row 1: Pending Workflow item */}
				<G transform="translate(35, 52)">
					<Rect
						x="0"
						y="0"
						width="130"
						height="34"
						rx="8"
						fill={colors.background}
						stroke={colors.border}
						strokeWidth="1"
					/>
					{/* Small PDF Icon indicator */}
					<Rect
						x="8"
						y="8"
						width="14"
						height="18"
						rx="2"
						fill="#7d86e8"
						opacity={0.2}
					/>
					<Path
						d="M 12 13 L 18 13 M 12 17 L 18 17"
						stroke="#5461e8"
						strokeWidth="1.5"
					/>
					{/* Text line mockup */}
					<Rect
						x="28"
						y="10"
						width="42"
						height="5"
						rx="2.5"
						fill={colors.foreground}
						opacity={0.6}
					/>
					<Rect
						x="28"
						y="19"
						width="25"
						height="4"
						rx="2"
						fill={colors.foreground}
						opacity={0.3}
					/>
					{/* Status badge: Pending (Yellow/Amber) */}
					<Rect
						x="82"
						y="9"
						width="40"
						height="16"
						rx="8"
						fill="rgba(245, 158, 11, 0.1)"
						stroke="rgba(245, 158, 11, 0.2)"
						strokeWidth="1"
					/>
					<Circle
						cx="90"
						cy="17"
						r="2.5"
						fill="#f59e0b"
					/>
					<SvgText
						x="97"
						y="21"
						fontSize="8"
						fontWeight="bold"
						fill="#d97706">
						PEND
					</SvgText>
				</G>

				{/* Row 2: Accepted Workflow item */}
				<G transform="translate(35, 94)">
					<Rect
						x="0"
						y="0"
						width="130"
						height="34"
						rx="8"
						fill={colors.background}
						stroke={colors.border}
						strokeWidth="1"
					/>
					<Rect
						x="8"
						y="8"
						width="14"
						height="18"
						rx="2"
						fill="#7d86e8"
						opacity={0.2}
					/>
					<Path
						d="M 12 13 L 18 13 M 12 17 L 18 17"
						stroke="#5461e8"
						strokeWidth="1.5"
					/>
					<Rect
						x="28"
						y="10"
						width="52"
						height="5"
						rx="2.5"
						fill={colors.foreground}
						opacity={0.6}
					/>
					<Rect
						x="28"
						y="19"
						width="30"
						height="4"
						rx="2"
						fill={colors.foreground}
						opacity={0.3}
					/>
					{/* Status badge: Accepted (Green) */}
					<Rect
						x="88"
						y="9"
						width="34"
						height="16"
						rx="8"
						fill="rgba(16, 185, 129, 0.1)"
						stroke="rgba(16, 185, 129, 0.2)"
						strokeWidth="1"
					/>
					<Circle
						cx="95"
						cy="17"
						r="2.5"
						fill="#10b981"
					/>
					<SvgText
						x="101"
						y="21"
						fontSize="8"
						fontWeight="bold"
						fill="#059669">
						ACP
					</SvgText>
				</G>

				{/* Row 3: Rejected Workflow item */}
				<G transform="translate(35, 136)">
					<Rect
						x="0"
						y="0"
						width="130"
						height="34"
						rx="8"
						fill={colors.background}
						stroke={colors.border}
						strokeWidth="1"
					/>
					<Rect
						x="8"
						y="8"
						width="14"
						height="18"
						rx="2"
						fill="#7d86e8"
						opacity={0.2}
					/>
					<Path
						d="M 12 13 L 18 13 M 12 17 L 18 17"
						stroke="#5461e8"
						strokeWidth="1.5"
					/>
					<Rect
						x="28"
						y="10"
						width="46"
						height="5"
						rx="2.5"
						fill={colors.foreground}
						opacity={0.6}
					/>
					<Rect
						x="28"
						y="19"
						width="20"
						height="4"
						rx="2"
						fill={colors.foreground}
						opacity={0.3}
					/>
					{/* Status badge: Rejected (Red) */}
					<Rect
						x="88"
						y="9"
						width="34"
						height="16"
						rx="8"
						fill="rgba(239, 68, 68, 0.1)"
						stroke="rgba(239, 68, 68, 0.2)"
						strokeWidth="1"
					/>
					<Circle
						cx="95"
						cy="17"
						r="2.5"
						fill="#ef4444"
					/>
					<SvgText
						x="101"
						y="21"
						fontSize="8"
						fontWeight="bold"
						fill="#dc2626">
						REJ
					</SvgText>
				</G>
			</Svg>
		</View>
	);
});

// Helper component for mockup lines
const LineMockup = ({ y, w, color }: { y: number; w: number; color: string }) => (
	<Rect
		x="55"
		y={y}
		width={w}
		height="4"
		rx="2"
		fill={color}
		opacity={0.3}
	/>
);
