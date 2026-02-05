import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://menspostdivorcecoaching.com',
  trailingSlash: 'never',
  build: {
    format: 'directory'
  },
  integrations: [sitemap()]
});