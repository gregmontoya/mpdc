import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://menspostdivorcecoaching.com',
  output: 'static',
  trailingSlash: 'never',

  build: {
    format: 'file',
    inlineStylesheets: 'always'
  },
  compressHTML: true,

  integrations: [
    sitemap({
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
    })
  ]
});
