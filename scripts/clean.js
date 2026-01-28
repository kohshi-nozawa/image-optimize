const fs = require('fs-extra');
const path = require('path');

const DIRS = ['distImg', 'distWebp'];

async function clean() {
  console.log('Cleaning output directories...');
  for (const d of DIRS) {
    // We use emptyDir to keep the directory but remove contents
    await fs.emptyDir(d);
    console.log(`Cleaned ${d}`);
  }
  console.log('Clean Complete.');
}

clean().catch(err => {
  console.error(err);
  process.exit(1);
});
