# Astro Migration Status

## Completed
- [x] **Core Architecture**: Installed Astro, setup Layouts, Header, Footer.
- [x] **Main Pages**: Migrated Home, About, Contact, Mission.
- [x] **Sales System**: Migrated `/join` (Sales Page).
- [x] **App System**: Migrated `/system/login` and `/system/dashboard`.
- [x] **Blog Index**: Migrated `/learn/` index page.
- [x] **SEO**: Generated Sitemap (`sitemap-index.xml`), added Google Analytics & Pinterest tags globally.
- [x] **Clean URLs**: Configured `trailingSlash: 'never'` and `.htaccess` for professional URLs without `.html`.
- [x] **Deployment**: Built site to `dist/` and deployed to root.

## Pending / Next Steps
- [ ] **Individual Blog Posts**: The articles in `/learn/*.html` are still static HTML. They work, but do not share the new Header/Footer yet.
- [ ] **Course Player**: The `/system/course.html` page is still legacy.
- [ ] **Success Page**: `/system/success.html` is legacy.

## How to Edit
- **Do not edit HTML files in the root.** These are generated!
- Edit files in `src/pages/`.
- Edit components in `src/components/`.
- Edit styles in `src/styles/`.

## How to Publish
1. Run `npm run build`
2. Run `cp -R dist/* .`
3. Git add, commit, push.
