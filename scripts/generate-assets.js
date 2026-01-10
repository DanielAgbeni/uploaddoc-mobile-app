const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_LOGO = path.join(
	__dirname,
	'../src/assets/app-images/UploadDoc Logo.png',
);
const APP_IMAGES_DIR = path.join(__dirname, '../src/assets/app-images');
const IMAGES_DIR = path.join(__dirname, '../src/assets/images');

const TASKS = [
	{
		name: 'icon.png',
		dir: APP_IMAGES_DIR,
		width: 1024,
		height: 1024,
		fit: 'contain',
	},
	{
		name: 'adaptive_icon.png',
		dir: APP_IMAGES_DIR,
		width: 1024,
		height: 1024,
		// Android adaptive icons: content should remain within the safe zone.
		// Using 'contain' ensures the logo fits entirely within the 1024x1024 canvas.
		// If the logo is square it will fill it. If it's not, it will be centered with transparency.
		// This is generally safe for Expo.
		fit: 'contain',
	},
	{
		name: 'favicon.png',
		dir: APP_IMAGES_DIR,
		width: 48,
		height: 48,
		fit: 'contain',
	},
	{
		name: 'splash_icon_light.png',
		dir: APP_IMAGES_DIR,
		width: 1024,
		height: 1024,
		fit: 'contain',
	},
	{
		name: 'splash_icon_dark.png',
		dir: APP_IMAGES_DIR,
		width: 1024,
		height: 1024,
		fit: 'contain',
	},
	{
		name: 'placeholder-light.png',
		dir: IMAGES_DIR,
		width: 800,
		height: 800,
		fit: 'contain',
	},
	{
		name: 'placeholder-dark.png',
		dir: IMAGES_DIR,
		width: 800,
		height: 800,
		fit: 'contain',
	},
];

async function generateAssets() {
	if (!fs.existsSync(SOURCE_LOGO)) {
		console.error(`Source logo not found at: ${SOURCE_LOGO}`);
		process.exit(1);
	}

	console.log('Generating assets from:', SOURCE_LOGO);

	try {
		const mainBuffer = fs.readFileSync(SOURCE_LOGO);

		for (const task of TASKS) {
			const outputPath = path.join(task.dir, task.name);
			console.log(`Generating ${task.name}...`);

			await sharp(mainBuffer)
				.resize({
					width: task.width,
					height: task.height,
					fit: task.fit || 'contain',
					background: { r: 0, g: 0, b: 0, alpha: 0 },
				})
				.toFile(outputPath);

			console.log(`Saved ${outputPath}`);
		}

		console.log('All assets generated successfully!');
	} catch (error) {
		console.error('Error generating assets:', error);
		process.exit(1);
	}
}

generateAssets();
