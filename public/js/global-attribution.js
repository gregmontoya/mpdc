/**
 * MPDC Global Attribution Tracker (Hyros-Lite)
 * Captures UTM parameters, Referrer, and Landing Page
 * Persists data to localStorage for attribution windows (30 days)
 */

(function () {
    console.log('🕵️‍♂️ MPDC Tracker Initializing...');

    const STORAGE_KEY = 'mpdc_attribution_pro';

    // Helper to get URL params
    const getParams = () => {
        const params = new URLSearchParams(window.location.search);
        let data = {};
        for (const [key, value] of params.entries()) {
            if (key.startsWith('utm_') || key === 'fbclid' || key === 'gclid') {
                data[key] = value;
            }
        }
        return data;
    };

    // Helper to get current data
    const getStoredData = () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    };

    // --- IDENTITY BRIDGE (ANONYMOUS TRACKING) ---
    const GUEST_KEY = 'mpdc_guest_id';

    const getGuestId = () => {
        let gid = localStorage.getItem(GUEST_KEY);
        if (!gid) {
            gid = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            localStorage.setItem(GUEST_KEY, gid);
        }
        return gid;
    };

    const pingActivity = async (data) => {
        const apiBase = window.location.hostname === 'localhost'
            ? 'http://localhost:3000'
            : 'https://mpdc-webhook-server.vercel.app';

        try {
            const guestId = getGuestId();
            const payload = {
                guestId,
                url: window.location.href,
                path: window.location.pathname,
                referrer: document.referrer || 'direct',
                attribution: data,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };

            // Use fetch with keepalive or sendBeacon for reliability
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                navigator.sendBeacon(`${apiBase}/track-activity`, blob);
            } else {
                fetch(`${apiBase}/track-activity`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    keepalive: true,
                    credentials: 'omit'
                });
            }
        } catch (e) {
            // Fail silently to not disrupt UX
        }
    };

    // Main Logic
    const init = () => {
        const currentParams = getParams();
        const storedData = getStoredData();

        // 1. Capture UTMs (Last Click Wins)
        if (Object.keys(currentParams).length > 0) {
            console.log('✅ Captured New UTMs:', currentParams);
            const newData = {
                ...storedData,
                ...currentParams,
                last_touch_at: new Date().toISOString(),
                landing_page: window.location.pathname
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        }

        // 2. Capture Referrer (If not internal navigation)
        if (document.referrer && !document.referrer.includes(window.location.hostname)) {
            console.log('🌍 Captured Referrer:', document.referrer);
            const currentData = getStoredData();
            if (!currentData.utm_source) {
                const newData = {
                    ...currentData,
                    utm_source: 'referral',
                    utm_medium: 'organic',
                    referrer: document.referrer,
                    last_touch_at: new Date().toISOString()
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            }
        }

        // 3. First Touch (If empty)
        const finalData = getStoredData();
        if (!finalData.first_touch_at) {
            finalData.first_touch_at = new Date().toISOString();
            finalData.first_landing_page = window.location.pathname;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
        }

        // 4. Ping Activity (Identity Bridge)
        pingActivity(finalData);

        // Debug Log
        console.table({ ...finalData, guest_id: getGuestId() });
    };

    // Run immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Attach to Window for Checkout Scripts to access
    window.getAttributionData = () => {
        return {
            ...getStoredData(),
            guest_id: getGuestId()
        };
    };

})();
