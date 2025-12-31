export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
	strength: PasswordStrength;
	score: number; // 0-4
	feedback: string;
	color: string;
}

/**
 * Calculate password strength based on various criteria
 */
export function calculatePasswordStrength(
	password: string,
): PasswordStrengthResult {
	if (!password) {
		return {
			strength: 'weak',
			score: 0,
			feedback: 'Password is required',
			color: '#ef4444',
		};
	}

	let score = 0;
	const feedback: string[] = [];

	// Length check
	if (password.length >= 8) {
		score++;
	} else {
		feedback.push('At least 8 characters');
	}

	if (password.length >= 12) {
		score++;
	}

	// Has lowercase
	if (/[a-z]/.test(password)) {
		score++;
	} else {
		feedback.push('lowercase letter');
	}

	// Has uppercase
	if (/[A-Z]/.test(password)) {
		score++;
	} else {
		feedback.push('uppercase letter');
	}

	// Has number
	if (/\d/.test(password)) {
		score++;
	} else {
		feedback.push('number');
	}

	// Has special character
	if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		score++;
	} else {
		feedback.push('special character');
	}

	// No common patterns
	const commonPatterns = ['123', 'abc', 'password', 'qwerty'];
	const hasCommonPattern = commonPatterns.some((pattern) =>
		password.toLowerCase().includes(pattern),
	);

	if (hasCommonPattern) {
		score = Math.max(0, score - 2);
		feedback.push('Avoid common patterns');
	}

	// Determine strength level
	let strength: PasswordStrength;
	let color: string;
	let finalFeedback: string;

	if (score <= 2) {
		strength = 'weak';
		color = '#ef4444'; // red
		finalFeedback =
			feedback.length > 0 ? `Add: ${feedback.join(', ')}` : 'Too weak';
	} else if (score <= 3) {
		strength = 'fair';
		color = '#f97316'; // orange
		finalFeedback =
			feedback.length > 0 ? `Add: ${feedback.join(', ')}` : 'Could be stronger';
	} else if (score <= 4) {
		strength = 'good';
		color = '#eab308'; // yellow
		finalFeedback = 'Good password';
	} else {
		strength = 'strong';
		color = '#22c55e'; // green
		finalFeedback = 'Strong password';
	}

	return {
		strength,
		score: Math.min(score, 4),
		feedback: finalFeedback,
		color,
	};
}
