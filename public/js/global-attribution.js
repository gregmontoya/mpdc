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
        // Only capture if referrer is external and we don't have UTMs dominating
        if (document.referrer && !document.referrer.includes(window.location.hostname)) {
            console.log('🌍 Captured Referrer:', document.referrer);
            const currentData = getStoredData();
            if (!currentData.utm_source) {
                // If no UTMs, treat referrer as source (Organic/Referral)
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

        // Debug Log
        console.table(finalData);
    };

    // Run immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Attach to Window for Checkout Scripts to access
    window.getAttributionData = () => {
        return getStoredData();
    };

})();
