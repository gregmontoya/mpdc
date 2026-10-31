const { exec } = require('child_process');
const path = require('path');

// TARGET TIMES (Spain Time / CET)
// Friday, March 6th, 2026
const REMINDER_12H = new Date('2026-03-06T06:00:00+01:00');
const REMINDER_1H = new Date('2026-03-06T17:00:00+01:00');

function scheduleEmail(targetDate, scriptName) {
    const now = new Date();
    const delay = targetDate.getTime() - now.getTime();

    if (delay <= 0) {
        console.log(`⚠️ Target time for ${scriptName} has already passed.`);
        return;
    }

    console.log(`⏰ Scheduled ${scriptName} for: ${targetDate.toLocaleString()}`);
    console.log(`⏳ Waiting ${Math.floor(delay / 1000 / 60 / 60)} hours and ${Math.floor((delay / 1000 / 60) % 60)} minutes...`);

    setTimeout(() => {
        console.log(`🚀 TRIGGERING: ${scriptName}`);
        exec(`node ${path.join(__dirname, scriptName)} --execute`, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error executing ${scriptName}:`, error);
                return;
            }
            console.log(stdout);
            if (stderr) console.error(stderr);
        });
    }, delay);
}

console.log('--- MPDC INTENSIVE SCHEDULER ---');
console.log(`Current Time: ${new Date().toLocaleString()}`);
console.log('--------------------------------');

scheduleEmail(REMINDER_12H, 'send-intensive-12h.js');
scheduleEmail(REMINDER_1H, 'send-intensive-1h.js');

console.log('--------------------------------');
console.log('KEEP THIS TERMINAL RUNNING TO AUTHORIZE SENDS.');
