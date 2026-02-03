const sharp = require('sharp');
const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');

const SRC_DIR = 'srcWebp';
const DIST_DIR = 'distWebp';

const PATTERN = '**/*.{png,jpg,jpeg,heic}';

async function convertToWebp() {
  const targetDir = process.argv[2];
  const isDirectMode = !!targetDir;

  const srcDir = isDirectMode ? targetDir : SRC_DIR;
  const distDir = isDirectMode ? targetDir : DIST_DIR;

  console.log(`Starting WebP Conversion... ${isDirectMode ? '(Direct Mode)' : ''}`);

  if (!isDirectMode) {
    await fs.ensureDir(distDir);
  } else {
    if (!fs.existsSync(srcDir)) {
      console.error(`Directory not found: ${srcDir}`);
      process.exit(1);
    }
  }

  const files = glob.sync(PATTERN, { cwd: srcDir, nodir: true, nocase: true });

  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const parse = path.parse(file);
    const destFile = path.join(parse.dir, parse.name + '.webp');
    const destPath = path.join(distDir, destFile);

    let needsUpdate = true;
    try {
      if (fs.existsSync(destPath)) {
        const srcStat = await fs.stat(srcPath);
        const destStat = await fs.stat(destPath);
        if (srcStat.mtime <= destStat.mtime) needsUpdate = false;
      }
    } catch (e) { }

    if (needsUpdate) {
      if (!isDirectMode) {
        await fs.ensureDir(path.dirname(destPath));
      }
      console.log(`Converting: ${file} -> ${destFile}`);
      await sharp(srcPath)
        .webp({ quality: 85 })
        .toFile(destPath);
    }
  }

  // Sync Orphans (Only in non-direct mode)
  if (!isDirectMode) {
    console.log('Cleaning orphans...');
    const distFiles = glob.sync('**/*.webp', { cwd: distDir, nodir: true });

    for (const distFile of distFiles) {
      const parse = path.parse(distFile);

      // Find matches in src
      const srcCandidates = files.filter(f => {
        const fParse = path.parse(f);
        return fParse.dir === parse.dir && fParse.name === parse.name;
      });

      if (srcCandidates.length === 0) {
        console.log(`Removing orphan: ${distFile}`);
        await fs.remove(path.join(distDir, distFile));
      }
    }
  }

  console.log('WebP Conversion Complete.');
}

convertToWebp().catch(err => {
  console.error(err);
  process.exit(1);
});
