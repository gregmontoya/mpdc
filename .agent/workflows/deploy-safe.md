# Safe Deployment Workflow

This project includes an integrity check to prevent "silent" breakages of the member portal and other critical pages.

## 🚀 How to Deploy Safely

Instead of running separate build and deploy commands, always use the safety-wrapped command:

```bash
npm run deploy-safe
```

### What this command does:
1. **Builds the site**: Generates the static HTML files in the `dist/` folder.
2. **Integrity Check**: Runs `scripts/pre-deploy-check.js` to verify that `login.html`, `dashboard.html`, and other critical pages actually exist.
3. **Firebase Deploy**: Only uploads the files to Firebase if the check passes.

## 🛑 What if it fails?

If the command stops and says `🛑 DEPLOYMENT ABORTED`:
- **DO NOT** attempt to deploy manually.
- **Check `astro.config.mjs`**: Ensure the `output` is set to `"static"`.
- **Run `npm run build`**: Look at the terminal output for any errors during the page generation phase.

## 🛠 Adding New Critical Pages
If you add a new important page (e.g., a new course module or a specific sales page) and want to protect it, add its path to the `REQUIRED_FILES` array in `scripts/pre-deploy-check.js`.
