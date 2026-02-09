const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/join/LIVE_SOURCE.html');
const astroPath = path.join(__dirname, '../src/pages/join/index.astro');

try {
    const html = fs.readFileSync(filePath, 'utf8');

    // Extract Body Content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : '';

    if (!bodyContent) {
        console.error("Could not find body content!");
        process.exit(1);
    }

    // Extract Styles
    const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    let styleContent = styleMatches ? styleMatches.join('\n') : '';

    // Clean up body content: Remove scripts that might conflict (optional, but good practice)
    // For now, keeping them to ensure functionality unless they are clearly global ones

    // Create the Astro file content
    // We wrap the body content in a fragment or divine to ensure it doesn't break Layout
    // But since we are using Layout, we should verify if the body content has a <nav> or <footer> 
    // that might conflict with Layout's defaults.
    // I added simpleHeader={true} to Layout, which hides the header.
    // I need to make sure Layout doesn't inject a footer if the body content has one.

    const astroContent = `---
import Layout from '../../layouts/Layout.astro';
import '../../styles/live-restore-1.css';
import '../../styles/live-restore-2.css';
import '../../styles/promo.css';
import '../../styles/modules.css'; // Use if previously created
---

<Layout title="Are You Stuck in Your Ex-Wife's Frame? | Men's Divorce Mindset System" simpleHeader={true} simpleFooter={true}>
    <fragment slot="head">
        <!-- Live Styles -->
        ${styleContent}
        <!-- HLS Video Support -->
        <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
        <script is:inline src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
        <!-- Fonts from Live Site -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
    </fragment>

    <div class="live-content-wrapper">
        ${bodyContent}
    </div>

    <script is:inline>
        // Restoration Scripts
        document.addEventListener('DOMContentLoaded', () => {
            // Fix Video Player
            if (typeof videojs !== 'undefined') {
                 // Find the video element - live site usually has id="vsl-video" or similar
                 const videoEl = document.querySelector('video');
                 if(videoEl) {
                    videoEl.id = 'vsl-player-restored';
                    videoEl.classList.add('video-js', 'vjs-big-play-centered');
                    
                    videojs('vsl-player-restored', {
                        fluid: true,
                        controls: true,
                        preload: 'auto',
                        sources: [{
                            src: 'https://storage.googleapis.com/mpdc-website-32dae.firebasestorage.app/streaming/VSL/manifest.m3u8',
                            type: 'application/x-mpegURL'
                        }]
                    });
                 }
            }
            
            // Fix Timer
            const timerEl = document.getElementById("join-timer") || document.querySelector('.timer-display');
            if (timerEl) {
                const targetDate = new Date('February 14, 2026 23:59:59').getTime();
                setInterval(() => {
                    const now = new Date().getTime();
                    const distance = targetDate - now;
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    timerEl.innerText = \`\${days}d \${hours}h \${minutes}m\`;
                }, 1000);
            }
        });
    </script>
</Layout>
`;

    fs.writeFileSync(astroPath, astroContent);
    console.log('Successfully wrote restored content to index.astro');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
