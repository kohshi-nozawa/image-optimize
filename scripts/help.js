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

  ${chalk.blue('npm run build [directory]')}
    Runs only image optimization.
    - Default Source: ./srcImg
    - Default Dest:   ./distImg
    - [directory]: Optional. If specified, optimizes images IN-PLACE in that directory.
    - Compresses JPG/PNG and converts HEIC to PNG.

  ${chalk.blue('npm run webp [directory]')}
    Runs only WebP conversion.
    - Default Source: ./srcWebp
    - Default Dest:   ./distWebp
    - [directory]: Optional. If specified, creates WebP files IN the same directory.
    - Converts JPG/PNG to WebP.

  ${chalk.blue('npm run clear')}
    Cleans all output directories (distImg, distWebp).

  ${chalk.blue('npm run help')}
    Displays this help message.
`);
