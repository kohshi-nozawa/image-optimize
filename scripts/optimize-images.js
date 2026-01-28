const sharp = require('sharp');
const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');

const SRC_DIR = 'srcImg';
const DIST_DIR = 'distImg';

// Supported extensions
const EXTENSIONS = ['png', 'jpg', 'jpeg', 'heic'];
const PATTERN = `**/*.{${EXTENSIONS.join(',')}}`; // glob is usually case-insensitive on Mac, but we can make it explicit if needed. 
// actually glob {a,b} is exact. We can use nocase option.

async function syncAndOptimize() {
  console.log('Starting Image Optimization...');
  
  // Ensure dist exists
  await fs.ensureDir(DIST_DIR);

  // 1. Get all source files
  const files = glob.sync(PATTERN, { cwd: SRC_DIR, nodir: true, nocase: true });
  
  // 2. Process each file
  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file);
    const parse = path.parse(file);
    
    // Determine output extension
    let outExt = parse.ext.toLowerCase();
    if (outExt === '.heic') {
      outExt = '.png';
    } else if (outExt === '.jpeg') {
        outExt = '.jpg';
    } 
    // Normalize Jpg/JPG/Png -> jpg/png
    
    // Construct destination path
    const destFile = path.join(parse.dir, parse.name + outExt);
    const destPath = path.join(DIST_DIR, destFile);

    // Check if processing is needed (mtime)
    let needsUpdate = true;
    try {
        if (fs.existsSync(destPath)) {
            const srcStat = await fs.stat(srcPath);
            const destStat = await fs.stat(destPath);
            // If dest is newer or equal, skip.
            // Note: processing takes time, so dest usually newer.
            // If src is newer than dest, update.
            if (srcStat.mtime <= destStat.mtime) {
                needsUpdate = false;
            }
        }
    } catch (e) {
        // ignore, process
    }

    if (needsUpdate) {
        await fs.ensureDir(path.dirname(destPath));
        console.log(`Processing: ${file} -> ${destFile}`);
        
        const ext = path.extname(srcPath).toLowerCase();
        let pipeline = sharp(srcPath);

        if (ext === '.heic') {
           pipeline = pipeline.png();
        } else if (ext === '.png') {
            pipeline = pipeline.png({
                quality: 80, // imagemin-pngquant like settings (0.7-0.85 roughly maps to efficient compression)
                compressionLevel: 9,
                palette: true
            });
        } else if (ext === '.jpg' || ext === '.jpeg') {
            pipeline = pipeline.jpeg({
                mozjpeg: true,
                quality: 85
            });
        }
        
        await pipeline.toFile(destPath);
    }
  }

  // 3. Clean orphans in dist
  console.log('Cleaning orphans...');
  const distFiles = glob.sync(`**/*.{png,jpg,jpeg}`, { cwd: DIST_DIR, nodir: true, nocase: true });
  
  for (const distFile of distFiles) {
      // Reconstruct potential source name
      // Logic: distFile is relative (e.g. sub/foo.png)
      // It could come from srcImg/sub/foo.png, srcImg/sub/foo.PNG, srcImg/sub/foo.heic, srcImg/sub/foo.HEIC...
      
      const parse = path.parse(distFile);
      const possibleSrcExts = ['.png', '.jpg', '.jpeg', '.heic']; // add all case variations if strict but nocase glob handles search
      
      let found = false;
      
      // We look for ANY file in src that would map to this dist file
      // A simple way is to check the file list we already gathered.
      
      // Filter files that match the name
      // This is O(N^2) but usage is likely small. If large, use a Set/Map.
      
      const srcCandidates = files.filter(f => {
          const fParse = path.parse(f);
          const fDir = fParse.dir; // relative dir
          const fName = fParse.name;
          
          // Check paths match
          if (fDir !== parse.dir) return false;
          if (fName !== parse.name) return false;
          
          // Check extension compatibility
          const fExt = fParse.ext.toLowerCase();
          const dExt = parse.ext.toLowerCase();
          
          if (fExt === dExt) return true; // png->png, jpg->jpg
          if ((fExt === '.jpeg' || fExt === '.jpg') && (dExt === '.jpg' || dExt === '.jpeg')) return true;
          if (fExt === '.heic' && dExt === '.png') return true;
          
          return false;
      });
      
      if (srcCandidates.length === 0) {
          console.log(`Removing orphan: ${distFile}`);
          await fs.remove(path.join(DIST_DIR, distFile));
      }
  }

  console.log('Image Optimization Complete.');
}

syncAndOptimize().catch(err => {
    console.error(err);
    process.exit(1);
});
