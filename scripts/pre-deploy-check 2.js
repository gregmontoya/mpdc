import fs from 'fs';
import path from 'path';

const REQUIRED_FILES = [
  'dist/index.html',
  'dist/system/login.html',
  'dist/join.html',
  'dist/learn.html'
];

console.log('🔍 Running Pre-Deploy Integrity Check...');

let missingFiles = [];

REQUIRED_FILES.forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ Found: ${file}`);
  } else {
    console.log(`❌ MISSING: ${file}`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('\n🛑 DEPLOYMENT ABORTED: The following critical pages were not generated:');
  missingFiles.forEach(f => console.error(`   - ${f}`));
  console.error('\nCheck your astro.config.mjs (ensure output: "static") and try again.');
  process.exit(1);
} else {
  console.log('\n🚀 Integrity Check Passed! Safe to deploy.');
  process.exit(0);
}
