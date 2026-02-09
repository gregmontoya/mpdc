
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backupDir = path.join(__dirname, '../_manual_backups');
const srcDir = path.join(__dirname, '../src');
const publicDir = path.join(__dirname, '../public');

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupName = `backup-${timestamp}`;
const backupPath = path.join(backupDir, backupName);

console.log(`Creating backup at ${backupPath}...`);
fs.mkdirSync(backupPath);

try {
    // Copy src directory
    console.log('Backing up src directory...');
    execSync(`cp -R "${srcDir}" "${path.join(backupPath, 'src')}"`);

    // Copy public directory (optional but recommended for assets)
    console.log('Backing up public directory...');
    execSync(`cp -R "${publicDir}" "${path.join(backupPath, 'public')}"`);

    // Create zip archive
    const zipFile = path.join(backupDir, `${backupName}.zip`);
    console.log(`Zipping to ${zipFile}...`);
    execSync(`zip -r "${zipFile}" "${backupName}"`, { cwd: backupDir });

    // Cleanup unzipped folder
    execSync(`rm -rf "${backupPath}"`);

    console.log(`✅ Backup created successfully: ${zipFile}`);
} catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
}
