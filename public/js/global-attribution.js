/**
 * MPDC Global Attribution Tracker (Hyros-Lite / Northbeam Style)
 * Advanced Multi-Touch Attribution Engine
 */

(function () {
    const STORAGE_KEY = 'mpdc_attribution_v2';
    const GUEST_KEY = 'mpdc_guest_id';

    // 1. Core Utilities
    const getParams = () => {
        const params = new URLSearchParams(window.location.search);
        let data = {};
        for (const [key, value] of params.entries()) {
            if (key.startsWith('utm_') || key === 'fbclid' || key === 'gclid' || key === 'msclkid' || key === 'ttclid') {
                data[key] = value;
            }
        }
        return data;
    };

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const getFingerprint = () => {
        return {
            sw: window.screen.width,
            sh: window.screen.height,
            ua: navigator.userAgent,
            lang: navigator.language,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    };

    // 2. Data Management
    const getStoredData = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : { first_touch: {}, last_touch: {}, history: [] };
        } catch (e) {
            return { first_touch: {}, last_touch: {}, history: [] };
        }
    };

    const getGuestId = () => {
        let gid = localStorage.getItem(GUEST_KEY);
        if (!gid) {
            gid = 'mpdc_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            localStorage.setItem(GUEST_KEY, gid);
        }
        return gid;
    };

    // 3. Main Tracking Logic
    const init = () => {
        const currentParams = getParams();
        const storedData = getStoredData();
        const guestId = getGuestId();
        const fingerprint = getFingerprint();
        const isNewVisit = !storedData.first_touch.timestamp;

        // 🛡️ Stealth Mode Check (Internal Traffic & Bots)
        const urlParams = new URLSearchParams(window.location.search);
        const forceTracking = urlParams.get('test_tracking') === 'true';
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
        const isExcludedGeo = tz.includes('Lisbon') || tz.includes('Madeira') || tz.includes('Azores') ||
            tz.includes('Madrid') || tz.includes('Ceuta') || tz.includes('Canary');
        const isBot = /bot|googlebot|crawler|spider|robot|crawling|Lighthouse|PageSpeed/i.test(navigator.userAgent);

        const isStealth = (isDev || isExcludedGeo || isBot) && !forceTracking;

        let updatedData = { ...storedData };

        // FIRST TOUCH (The 'Introduction')
        if (isNewVisit) {
            console.log('🏁 MPDC Tracker: New User Identified');
            updatedData.first_touch = {
                ...currentParams,
                referrer: document.referrer || 'direct',
                landing_page: window.location.pathname,
                timestamp: new Date().toISOString(),
                fingerprint
            };
        }

        // LAST TOUCH (The 'Closer')
        if (Object.keys(currentParams).length > 0) {
            console.log('🎯 MPDC Tracker: Attribution Source Updated', currentParams);
            updatedData.last_touch = {
                ...currentParams,
                referrer: document.referrer || 'direct',
                landing_page: window.location.pathname,
                timestamp: new Date().toISOString()
            };
        }

        // ALWAYS SYNC COOKIES (For FB CAPI & Google)
        updatedData.fbp = getCookie('_fbp') || updatedData.fbp;
        updatedData.fbc = getCookie('_fbc') || updatedData.fbc;
        updatedData.ga = getCookie('_ga') || updatedData.ga;

        // HISTORY (Journey Mapping)
        if (!updatedData.history) updatedData.history = [];
        if (updatedData.history.length < 20) {
            updatedData.history.push({
                path: window.location.pathname,
                time: new Date().toISOString()
            });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
        window.mpdc_data = { ...updatedData, guest_id: guestId };

        // PING WEBHOOK (Delayed to protect CWV & respect Stealth Mode)
        if (!isStealth) {
            if (document.readyState === 'complete') {
                setTimeout(() => pingActivity(window.mpdc_data), 3000);
            } else {
                window.addEventListener('load', () => {
                    setTimeout(() => pingActivity(window.mpdc_data), 3000);
                });
            }
        } else {
            console.log('🕵️‍♂️ MPDC Tracker: Stealth Mode active (Tracking paused)');
        }

        // Debug Table
        console.log('🕵️‍♂️ MPDC Attribution Data:');
        console.table({
            guest_id: guestId,
            first_source: updatedData.first_touch.utm_source || 'direct',
            last_source: updatedData.last_touch.utm_source || 'direct',
            campaign: updatedData.last_touch.utm_campaign || 'none'
        });
    };

    const pingActivity = async (payload) => {
        const apiBase = window.location.hostname === 'localhost'
            ? 'http://localhost:3000'
            : 'https://webhook-server-xi-nine.vercel.app';

        try {
            const data = {
                ...payload,
                url: window.location.href,
                userAgent: navigator.userAgent
            };

            if (navigator.sendBeacon) {
                navigator.sendBeacon(`${apiBase}/track-activity`, new Blob([JSON.stringify(data)], { type: 'application/json' }));
            } else {
                fetch(`${apiBase}/track-activity`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    keepalive: true
                });
            }
        } catch (e) { }
    };

    // 4. Execution
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for Global Use (Checkout Scripts / Buttons)
    window.getAttributionData = () => window.mpdc_data;

    // AUTO-PERSIST UTMs TO LINKS
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && (link.href.includes('/join') || link.href.includes('skool.com'))) {
            try {
                const url = new URL(link.href);
                const data = window.mpdc_data.last_touch;
                if (data.utm_source) url.searchParams.set('utm_source', data.utm_source);
                if (data.utm_medium) url.searchParams.set('utm_medium', data.utm_medium);
                if (data.fbclid) url.searchParams.set('fbclid', data.fbclid);
                if (data.gclid) url.searchParams.set('gclid', data.gclid);
                link.href = url.toString();
            } catch (err) { }
        }
    });

})();
