/**
 * Attribution Tracking Library
 * Handles capturing and persisting traffic source data (UTM, Referrer, Click IDs)
 */

const STORAGE_KEY_FIRST_TOUCH = 'mpdc_attribution_first_touch';
const STORAGE_KEY_LAST_TOUCH = 'mpdc_attribution_last_touch';

// Parameters to track
const TRACKING_PARAMS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',     // Google Click ID
    'fbclid',    // Facebook Click ID
    'ttclid',    // TikTok Click ID
    'irclickid', // Impact Radius
    'msclkid'    // Microsoft Click ID
];

/**
 * Capture current traffic source and store it.
 * Should be called on every page load (client-side).
 */
export function initAttribution() {
    if (typeof window === 'undefined') return;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const referrer = document.referrer;

        // Check if we have any tracking params or external referrer
        const hasTrackingParams = TRACKING_PARAMS.some(param => urlParams.has(param));
        const isExternalReferrer = referrer && !referrer.includes(window.location.hostname);

        if (hasTrackingParams || isExternalReferrer) {
            const attributionData = {
                timestamp: new Date().toISOString(),
                referrer: referrer || 'direct',
                landing_page: window.location.pathname,
                user_agent: navigator.userAgent,
            };

            // Extract params
            TRACKING_PARAMS.forEach(param => {
                if (urlParams.has(param)) {
                    attributionData[param] = urlParams.get(param);
                }
            });

            // 1. Set First Touch (if not exists)
            if (!localStorage.getItem(STORAGE_KEY_FIRST_TOUCH)) {
                localStorage.setItem(STORAGE_KEY_FIRST_TOUCH, JSON.stringify(attributionData));
            }

            // 2. Always Update Last Touch
            localStorage.setItem(STORAGE_KEY_LAST_TOUCH, JSON.stringify(attributionData));
        } else if (!localStorage.getItem(STORAGE_KEY_FIRST_TOUCH)) {
            // If no tracking params but it's the first visit (and direct), store as direct
            const directData = {
                timestamp: new Date().toISOString(),
                referrer: 'direct',
                landing_page: window.location.pathname,
                user_agent: navigator.userAgent,
                source: 'direct',
                medium: 'none'
            };
            localStorage.setItem(STORAGE_KEY_FIRST_TOUCH, JSON.stringify(directData));
            localStorage.setItem(STORAGE_KEY_LAST_TOUCH, JSON.stringify(directData));
        }
    } catch (e) {
        console.warn('Attribution tracking failed:', e);
    }
}

/**
 * Retrieve current attribution data for form submission/checkout
 */
export function getAttributionData() {
    if (typeof window === 'undefined') return {};

    try {
        const firstTouch = JSON.parse(localStorage.getItem(STORAGE_KEY_FIRST_TOUCH) || '{}');
        const lastTouch = JSON.parse(localStorage.getItem(STORAGE_KEY_LAST_TOUCH) || '{}');

        // Flatten for easier usage in typical analytics structures (e.g. Stripe Metadata)
        // We prioritize Last Touch for immediate conversion data, but keep First Touch
        const combined = {
            // Core Source (Last Touch)
            utm_source: lastTouch.utm_source || firstTouch.utm_source || 'direct',
            utm_medium: lastTouch.utm_medium || firstTouch.utm_medium || 'none',
            utm_campaign: lastTouch.utm_campaign || firstTouch.utm_campaign || '',
            utm_content: lastTouch.utm_content || firstTouch.utm_content || '',
            utm_term: lastTouch.utm_term || firstTouch.utm_term || '',

            // Click IDs (Prioritize Last Touch, fallback to First)
            gclid: lastTouch.gclid || firstTouch.gclid || '',
            fbclid: lastTouch.fbclid || firstTouch.fbclid || '',

            // Context
            referrer: lastTouch.referrer || firstTouch.referrer || '',
            landing_page: lastTouch.landing_page || '',
            first_landing_page: firstTouch.landing_page || '',

            // Explicit First Touch Data (prefixed)
            first_touch_source: firstTouch.utm_source || 'direct',
            first_touch_medium: firstTouch.utm_medium || 'none',
            first_touch_campaign: firstTouch.utm_campaign || '',

            // Time
            first_visit_time: firstTouch.timestamp || new Date().toISOString(),
            last_visit_time: lastTouch.timestamp || new Date().toISOString()
        };

        return combined;
    } catch (e) {
        return {};
    }
}
