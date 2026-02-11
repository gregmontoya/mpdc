import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://menspostdivorcecoaching.com',
  output: 'server',
  trailingSlash: 'never',

  build: {
    format: 'file',
    inlineStylesheets: 'always'
  },
  compressHTML: true,

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  },

  integrations: [sitemap()],

  adapter: node({
    mode: 'middleware'
  })
});