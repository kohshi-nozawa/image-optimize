const chalk = {
  // Simple chalk-like implementation to avoid dependency if not needed, 
  // or we can use console.log with ANSI codes directly.
  // Since we didn't add chalk, I'll use ANSI codes for basics.
  blue: (text) => `\x1b[36m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

console.log(`
${chalk.bold('Image Optimize Tools')}

${chalk.green('Available Commands:')}

  ${chalk.blue('npm start')}
    Runs both image optimization and WebP conversion.
    Use this to process all images in both src directories.

  ${chalk.blue('npm run build')}
    Runs only image optimization.
    - Source: ./srcImg
    - Dest:   ./distImg
    - Compresses JPG/PNG and converts HEIC to PNG.

  ${chalk.blue('npm run webp')}
    Runs only WebP conversion.
    - Source: ./srcWebp
    - Dest:   ./distWebp
    - Converts JPG/PNG to WebP.

  ${chalk.blue('npm run clear')}
    Cleans all output directories (distImg, distWebp).

  ${chalk.blue('npm run help')}
    Displays this help message.
`);
