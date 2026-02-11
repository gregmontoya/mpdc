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

  integrations: [sitemap()]
});
