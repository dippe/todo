# PWA Testing Guide

## Overview

This document provides guidance on testing the PWA (Progressive Web App) functionality of the TODO application, specifically User Story 5 (Offline PWA Functionality).

## Important Note: Service Worker Testing

**The service worker only registers in production mode** (as configured in src/main.tsx:62). This is intentional to avoid caching issues during development.

As a result, the offline E2E tests in `tests/e2e/offline.spec.ts` will **PASS** when run against a production build, but **FAIL** when run against the dev server.

## Running PWA Tests

### Option 1: Test Against Production Build (Recommended)

```bash
# Build the production version
npm run build

# Preview the production build
npm run preview

# In another terminal, run E2E tests against production
npm run test:e2e -- tests/e2e/offline.spec.ts
```

### Option 2: Manual Testing

The following tests (T115-T118) require manual testing on real devices:

- **T115**: Test app install on mobile Safari (iOS)
- **T116**: Test app install on Android Chrome
- **T117**: Test app install on desktop browsers (Chrome, Edge)
- **T118**: Verify standalone mode launch (no browser chrome)

#### Manual Testing Steps

1. **Build and Deploy**:

   ```bash
   npm run build
   npm run preview
   ```

2. **Test on Mobile Safari (iOS)**:
   - Open Safari on iPhone/iPad
   - Navigate to the app URL
   - Tap the Share button
   - Select "Add to Home Screen"
   - Open the app from home screen
   - Verify standalone mode (no browser chrome)
   - Turn on Airplane Mode
   - Verify all CRUD operations work offline

3. **Test on Android Chrome**:
   - Open Chrome on Android device
   - Navigate to the app URL
   - Look for the "Install" prompt or banner
   - Tap "Install" to add to home screen
   - Open the app from home screen
   - Verify standalone mode
   - Turn on Airplane Mode
   - Verify all CRUD operations work offline

4. **Test on Desktop Browsers**:
   - Open Chrome/Edge on desktop
   - Navigate to the app URL
   - Look for the install icon in the address bar (⊕ or download icon)
   - Click to install the PWA
   - Launch the installed app
   - Verify standalone window (no browser address bar)
   - Open DevTools → Application → Service Workers
   - Check "Offline" mode
   - Verify all CRUD operations work offline

## Test Coverage

### Automated Tests (offline.spec.ts)

The E2E test suite covers the following scenarios:

1. **Service Worker Installation**:
   - Verifies service worker registers successfully
   - Checks service worker is in 'activated' state

2. **Cached Resource Loading**:
   - Tests that static assets are served from cache when offline
   - Verifies instant load from cache on repeat visits (<2s)

3. **Offline CRUD Operations**:
   - Create tasks while offline
   - Toggle task completion while offline
   - Delete tasks while offline
   - Persist tasks across offline reloads

4. **PWA Manifest Validation**:
   - Checks manifest.json is valid and linked
   - Verifies required properties (name, icons, display mode, etc.)
   - Validates icon sizes (192x192, 512x512)
   - Checks theme-color meta tag
   - Verifies apple-touch-icon for iOS

5. **Offline Detection**:
   - Tests navigator.onLine API
   - Verifies offline status detection

6. **Multiple Operations**:
   - Tests complex sequences of CRUD operations while offline

### Manual Tests (Pending)

The following scenarios require manual testing on real devices:

- **T115**: iOS Safari installation and offline functionality
- **T116**: Android Chrome installation and offline functionality
- **T117**: Desktop browser (Chrome, Edge) installation
- **T118**: Standalone mode verification (no browser chrome)

## Troubleshooting

### Service Worker Not Registering

**Problem**: Tests fail with "service worker not registered" errors.

**Solution**: Ensure you're running tests against a production build, not the dev server:

```bash
npm run build
npm run preview  # Runs on port 4173 by default
npm run test:e2e -- tests/e2e/offline.spec.ts
```

If using the preview server, update the Playwright config baseURL to match:

```typescript
// playwright.config.ts
use: {
  baseURL: 'http://localhost:4173', // Preview server port
}
```

### Offline Tests Fail with ERR_INTERNET_DISCONNECTED

**Problem**: Tests fail when setting context offline.

**Solution**: This is expected in dev mode. Service workers are required for offline functionality. Run tests against production build.

### Browser Not Installed (Firefox/WebKit)

**Problem**: Tests fail with "Executable doesn't exist" for Firefox or WebKit.

**Solution**: Install Playwright browsers:

```bash
npx playwright install
```

Or run tests only on Chromium:

```bash
npm run test:e2e -- tests/e2e/offline.spec.ts --project=chromium
```

## Success Criteria

All tests pass when run against a production build, validating:

- **SC-002**: App loads in <2s on 3G network (cached)
- **SC-003**: All CRUD operations work offline
- **SC-006**: App can be installed on mobile and desktop
- **SC-009**: App works offline for extended periods (days/weeks)
- **SC-010**: Zero data loss during offline operations

## References

- **User Story 5**: specs/001-todo-pwa-app/spec.md (US5)
- **Tasks**: specs/001-todo-pwa-app/tasks.md (T099-T118)
- **Service Worker**: public/service-worker.js
- **PWA Manifest**: public/manifest.json
- **Registration**: src/main.tsx (registerServiceWorker function)
