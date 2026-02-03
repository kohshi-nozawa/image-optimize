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
    const targetDir = process.argv[2];
    const isDirectMode = !!targetDir;

    const srcDir = isDirectMode ? targetDir : SRC_DIR;
    const distDir = isDirectMode ? targetDir : DIST_DIR;

    console.log(`Starting Image Optimization... ${isDirectMode ? '(Direct Mode)' : ''}`);

    // Ensure dist exists (only if not direct mode, or just ensure target exists)
    if (!isDirectMode) {
        await fs.ensureDir(distDir);
    } else {
        if (!fs.existsSync(srcDir)) {
            console.error(`Directory not found: ${srcDir}`);
            process.exit(1);
        }
    }

    // 1. Get all source files
    const files = glob.sync(PATTERN, { cwd: srcDir, nodir: true, nocase: true });

    // 2. Process each file
    for (const file of files) {
        const srcPath = path.join(srcDir, file);
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
        const destPath = path.join(distDir, destFile);

        // Check if processing is needed (mtime)
        let needsUpdate = true;
        try {
            if (fs.existsSync(destPath)) {
                const srcStat = await fs.stat(srcPath);
                const destStat = await fs.stat(destPath);
                // If dest is newer or equal, skip.
                // Note: processing takes time, so dest usually newer.
                // If src is newer than dest, update.
                // In direct mode (overwrite), we might always want to process if we can't tell? 
                // actually if we overwrite, the mtime will update. So same logic holds. 
                // BUT if src == dest, we are overwriting. usage: manually run. 
                // If user runs manually on dir, maybe they expect run?
                // Let's keep logic: if src <= dest, skip.
                // When overwriting, dest IS src (if ext same). 
                // If dest exists (it's the same file), mtime is same. so it skips?
                // Wait, if src == dest, srcStat.mtime === destStat.mtime. -> needsUpdate = false.
                // So repeated runs are safe.
                // But how do we trigger first run? 
                // If I have image.jpg. I run script. destPath == srcPath.
                // srcStat.mtime == destStat.mtime. -> SKIPS.
                // We need to Force update if src == dest AND we assume it's not optimized?
                // Or maybe we rely on checking if it differs?
                // For now, let's say: if isDirectMode AND srcPath === destPath, we might need a flag or just force?
                // Actually, usually tools check if it can be optimized further. Sharp doesn't easily tell us.
                // Let's assume if isDirectMode, the user WANTS to optimize. 
                // But if we run it twice, we don't want to double compress.
                // Maybe we can skip if it was modified recently? No.
                // Let's just allow Skip if mtime match, BUT for same-file, we might have an issue.
                // If srcPath === destPath, existing logic "srcStat.mtime <= destStat.mtime" returns TRUE (needsUpdate=false).
                // So we effectively NEVER optimize in-place with this logic.
                // Fix: If isDirectMode, always process? Or checking something else?
                // Let's blindly process in Direct Mode for now, assuming user called it intentionally.
                // Or better: If src!=dest, use standard logic. If src==dest, process.
                if (srcPath === destPath) {
                    needsUpdate = true;
                } else if (srcStat.mtime <= destStat.mtime) {
                    needsUpdate = false;
                }
            }
        } catch (e) {
            // ignore, process
        }

        if (needsUpdate) {
            if (!isDirectMode) {
                await fs.ensureDir(path.dirname(destPath));
            }
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

            if (srcPath === destPath) {
                // Write to temp file then rename
                const tempPath = destPath + '.tmp';
                await pipeline.toFile(tempPath);
                await fs.move(tempPath, destPath, { overwrite: true });
            } else {
                await pipeline.toFile(destPath);
            }
        }
    }

    // 3. Clean orphans in dist (Only in non-direct mode)
    if (!isDirectMode) {
        console.log('Cleaning orphans...');
        const distFiles = glob.sync(`**/*.{png,jpg,jpeg}`, { cwd: distDir, nodir: true, nocase: true });

        for (const distFile of distFiles) {
            // Reconstruct potential source name
            // Logic: distFile is relative (e.g. sub/foo.png)
            // It could come from srcImg/sub/foo.png, srcImg/sub/foo.PNG, srcImg/sub/foo.heic, srcImg/sub/foo.HEIC...

            const parse = path.parse(distFile);

            // We look for ANY file in src that would map to this dist file
            // A simple way is to check the file list we already gathered.

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
                await fs.remove(path.join(distDir, distFile));
            }
        }
    }

    console.log('Image Optimization Complete.');
}

syncAndOptimize().catch(err => {
    console.error(err);
    process.exit(1);
});
