# Site Updates & Changelog

## [v2.0.0] - 2026-02-05 - Migration to Astro SSG

### 🚀 Major Architecture Upgrade
The website has been successfully migrated from static HTML files to the **Astro Static Site Generator**. This update improves performance, maintainability, and SEO capabilities while preserving the existing design integrity.

### ✨ Key Improvements
- **Component-Based Architecture**: 
  - Created reusable `Header`, `Footer`, and `Layout` components.
  - Updates to navigation or footer links now reflect globally across all pages instantly.
- **Improved Performance**:
  - Assets are optimized and bundled during the build process.
  - Clean code structure reduces redundancy.
- **Enhanced SEO**:
  - Automated XML Sitemap generation (`sitemap-index.xml`).
  - Google Analytics and Pinterest verification tags injected globally.
  - Semantic HTML structure maintained.

### 🔄 Migration Details
- **Core Pages**: `Home`, `About`, `Contact`, `Mission` converted to Astro components.
- **Sales System**: `/join` page migrated with a custom minimal header optimized for conversion.
- **Student Portal**: `/system/login` and `/system/dashboard` migrated and integrated with Supabase authentication.
- **Blog**: `/learn` index page migrated.
- **Legacy Support**: Existing blog posts (`/learn/*.html`) are preserved as static HTML and fully supported via restored CSS assets.

### 🛠 Technical Notes
- **Source Code**: All editable source files are now in `src/`.
- **Build Output**: The site is built to `dist/` and deployed to the root directory.
- **Backup**: Original static HTML files have been backed up to `_backup_html/`.
- **Config**: Updated `main.js` to handle clean URL routing for the dashboard system.

---
