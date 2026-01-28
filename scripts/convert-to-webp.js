const sharp = require('sharp');
const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');

const SRC_DIR = 'srcWebp';
const DIST_DIR = 'distWebp';

const PATTERN = '**/*.{png,jpg,jpeg}'; // No HEIC for webp src usually? Default gulp file had png,jpg,jpeg.

async function convertToWebp() {
  console.log('Starting WebP Conversion...');

  await fs.ensureDir(DIST_DIR);

  const files = glob.sync(PATTERN, { cwd: SRC_DIR, nodir: true, nocase: true });

  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file);
    const parse = path.parse(file);
    const destFile = path.join(parse.dir, parse.name + '.webp');
    const destPath = path.join(DIST_DIR, destFile);

    let needsUpdate = true;
    try {
      if (fs.existsSync(destPath)) {
        const srcStat = await fs.stat(srcPath);
        const destStat = await fs.stat(destPath);
        if (srcStat.mtime <= destStat.mtime) needsUpdate = false;
      }
    } catch (e) { }

    if (needsUpdate) {
      await fs.ensureDir(path.dirname(destPath));
      console.log(`Converting: ${file} -> ${destFile}`);
      await sharp(srcPath)
        .webp({ quality: 85 })
        .toFile(destPath);
    }
  }

  // Sync Orphans
  console.log('Cleaning orphans...');
  const distFiles = glob.sync('**/*.webp', { cwd: DIST_DIR, nodir: true });

  for (const distFile of distFiles) {
    const parse = path.parse(distFile);

    // Find matches in src
    const srcCandidates = files.filter(f => {
      const fParse = path.parse(f);
      return fParse.dir === parse.dir && fParse.name === parse.name;
    });

    if (srcCandidates.length === 0) {
      console.log(`Removing orphan: ${distFile}`);
      await fs.remove(path.join(DIST_DIR, distFile));
    }
  }

  console.log('WebP Conversion Complete.');
}

convertToWebp().catch(err => {
  console.error(err);
  process.exit(1);
});
