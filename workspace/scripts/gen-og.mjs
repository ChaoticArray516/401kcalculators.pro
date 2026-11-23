import sharp from 'sharp';

await sharp('public/og/og-default.svg')
  .resize(1200, 630)
  .png()
  .toFile('public/og/og-default.png');
