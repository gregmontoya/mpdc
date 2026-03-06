import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'https://menspostdivorcecoaching.com',
  output: 'static',
  trailingSlash: 'never',

  redirects: {
    '/12-month-credit-reset-protocol': '/learn/12-month-credit-reset-protocol',
    '/5-strategies-rebuild-life-divorce': '/learn/5-strategies-rebuild-life-divorce',
    '/asset-protection-tactical-audit': '/learn/asset-protection-tactical-audit',
    '/biological-stress-of-divorce': '/learn/biological-stress-of-divorce',
    '/boundaries-ex-wife': '/learn/boundaries-ex-wife',
    '/ceo-mindset-post-divorce': '/learn/ceo-mindset-post-divorce',
    '/child-support-scarcity-math': '/learn/child-support-scarcity-math',
    '/co-parenting-guide-men': '/learn/co-parenting-guide-men',
    '/dating-after-divorce-protocol': '/learn/dating-after-divorce-protocol',
    '/depressed-husband-protocol': '/learn/depressed-husband-protocol',
    '/divorce-economics-audit': '/learn/divorce-economics-audit',
    '/divorce-tattoos-identity-anchors': '/learn/divorce-tattoos-identity-anchors',
    '/dvpo-legal-snare': '/learn/dvpo-legal-snare',
    '/economics-of-bitterness': '/learn/economics-of-bitterness',
    '/emergency-divorce-panic-protocol': '/learn/emergency-divorce-panic-protocol',
    '/emotional-abuse-warning-signs': '/learn/emotional-abuse-warning-signs',
    '/gray-rock-method': '/learn/gray-rock-method',
    '/how-divorce-changes-a-man': '/learn/how-divorce-changes-a-man',
    '/legacy-standard-purpose': '/learn/legacy-standard-purpose',
    '/long-distance-parenting-protocol': '/learn/long-distance-parenting-protocol',
    '/managing-anger-men': '/learn/managing-anger-men',
    '/mens-shame-in-divorce-recovery': '/learn/mens-shame-in-divorce-recovery',
    '/monkey-branching-divorce': '/learn/monkey-branching-divorce',
    '/narcissist-guilt-trap-protocol': '/learn/narcissist-guilt-trap-protocol',
    '/narcissistic-wife-patterns': '/learn/narcissistic-wife-patterns',
    '/new-social-circle-men': '/learn/new-social-circle-men',
    '/parallel-parenting': '/learn/parallel-parenting',
    '/parental-alienation-response-guide': '/learn/parental-alienation-response-guide',
    '/post-divorce-tax-strategy': '/learn/post-divorce-tax-strategy',
    '/rebuilding-your-reality-chain': '/learn/rebuilding-your-reality-chain',
    '/red-flag-decoder': '/learn/red-flag-decoder',
    '/right-of-first-refusal-dads': '/learn/right-of-first-refusal-dads',
    '/signs-emotional-immaturity-woman': '/learn/signs-emotional-immaturity-woman',
    '/starting-over-after-40-divorce-stats': '/learn/starting-over-after-40-divorce-stats',
    '/stop-overthinking-men': '/learn/stop-overthinking-men',
    '/stop-reactionary-communication-ex-wife': '/learn/stop-reactionary-communication-ex-wife',
    '/vagus-nerve-reset': '/learn/vagus-nerve-reset',
    '/victim-mentality-men': '/learn/victim-mentality-men',
    '/when-start-dating': '/learn/when-start-dating'
  },

  build: {
    format: 'file',
    inlineStylesheets: 'always'
  },
  compressHTML: true,

  integrations: [sitemap({
    filter: (page) => {
      const internalPaths = [
        '/crm',
        '/admin',
        '/system',
        '/go/',
        '/dev/',
        '/blocks',
        '/coming-soon-backup',
        '-backup',
        '-OLD-BACKUP',
        'LIVE_SOURCE'
      ];
      return !internalPaths.some(path => page.includes(path));
    }
  }), partytown({
    config: {
      forward: ['dataLayer.push']
    }
  })]
});