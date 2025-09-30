# 🚀 Deployment Checklist

## Pre-Deployment Validation

Use this checklist before deploying to any environment to ensure a smooth deployment.

### ✅ Code Quality

- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Linting passes: `npm run lint` (max 500 warnings allowed)
- [ ] Type checking passes: `npm run typecheck`
- [ ] Security scan clean: `npm run check-security`

### ✅ Environment Configuration

- [ ] `.env.example` is up to date with all required variables
- [ ] Environment variables are properly set in GitHub Secrets
- [ ] `VITE_APP_ENVIRONMENT` is set correctly for target environment
- [ ] `VITE_WCB_API_ENDPOINT` is configured
- [ ] Base path in `vite.config.ts` matches deployment URL

### ✅ Assets & Resources

- [ ] All manifest icons exist and are referenced correctly
- [ ] Favicon files present (`favicon.svg`, `apple-touch-icon.png`)
- [ ] PWA service worker is up to date (`public/sw.js`)
- [ ] All public assets are properly versioned

### ✅ Build Verification

- [ ] Production build completes without errors
- [ ] Bundle size is within acceptable limits (< 2MB main chunk)
- [ ] No critical console errors in built app
- [ ] Source maps are generated for debugging

### ✅ Deployment Configuration

- [ ] GitHub Pages is enabled for the repository
- [ ] Workflow files are valid and tested
- [ ] Branch protection rules are configured (if applicable)
- [ ] Deployment secrets are configured in repository settings

### ✅ Post-Deployment Verification

- [ ] Application loads successfully at deployment URL
- [ ] Service worker registers correctly
- [ ] All navigation routes work
- [ ] Core features function (pain entry, analytics, export)
- [ ] PWA install prompt appears (mobile/supported browsers)
- [ ] No console errors in production build

## Environment-Specific Checks

### Production Deployment

- [ ] Version number is bumped in `package.json`
- [ ] CHANGELOG is updated
- [ ] Release notes are prepared
- [ ] Rollback plan is documented
- [ ] Monitoring is configured and active

### Staging Deployment

- [ ] Test data is available
- [ ] Feature flags are configured appropriately
- [ ] QA team is notified
- [ ] Test plan is prepared

### Preview Deployment (PR)

- [ ] PR description includes testing instructions
- [ ] Breaking changes are documented
- [ ] Screenshots are included for UI changes

## Quick Commands

```bash
# Run full validation suite
npm run check-security && npm run lint && npm test && npm run build

# Validate deployment configuration
npm run deploy:validate

# Check deployment status
npm run deploy:status

# Run health checks
npm run deploy:healthcheck
```

## Known Issues & Limitations

### Expected Build Warnings

1. **Script bundling warnings**: `pwa-init.js` and `pwa-demo.js` warnings are expected
   - These are intentionally not bundled by Vite
   - They are copied as-is to the dist folder

2. **Bundle size warnings**: Main chunk exceeds 500kB
   - This is acceptable for the current application size
   - Code splitting improvements are planned for future releases

3. **Preview deployments**: Currently simulate deployment
   - Artifacts are built and uploaded but not published to Pages
   - Full preview deployment requires additional GitHub token configuration

### Lint Warnings

- Up to 500 warnings are allowed (configured in package.json)
- Most warnings are `@typescript-eslint/no-explicit-any` which will be addressed incrementally
- Zero errors are required for deployment

## Troubleshooting

### Build Fails

1. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps`
2. Clear Vite cache: `rm -rf .vite dist`
3. Check Node version: `node -v` (should be 20.x)

### Deployment Fails

1. Check GitHub Actions logs
2. Verify secrets are set correctly
3. Ensure branch permissions are correct
4. Check for merge conflicts

### Assets Not Loading

1. Verify base path in vite.config.ts matches deployment URL
2. Check that all referenced assets exist in public folder
3. Verify manifest.json references are correct
4. Clear browser cache and service worker

## Rollback Procedure

If deployment causes issues:

1. Use GitHub Pages workflow with rollback option
2. Trigger rollback via GitHub Actions UI
3. Specify the target version tag (e.g., v0.1.0)
4. Monitor deployment health checks
5. Verify rollback was successful

```bash
# Via GitHub CLI
gh workflow run pages.yml --field rollback_to=v0.1.0
```

## Support

For deployment issues:

1. Check GitHub Actions logs: https://github.com/CrisisCore-Systems/pain-tracker/actions
2. Review deployment documentation: `docs/DEPLOYMENT.md`
3. Create an issue with deployment logs and error messages
4. Contact the development team

---

**Last Updated**: 2024-09-30
**Version**: 0.1.0
