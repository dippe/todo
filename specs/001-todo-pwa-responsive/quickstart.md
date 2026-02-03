# Quick Start Guide: TODO PWA

## Overview
This guide provides step-by-step instructions for setting up and running the TODO PWA project.

---

## Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest version)

---

## Initial Setup

### 1. Create Project

```bash
# Create Vite project with React + TypeScript
npm create vite@latest todo-pwa -- --template react-ts

# Navigate to project directory
cd todo-pwa
```

### 2. Install Dependencies

```bash
# Install core dependencies
npm install

# Install PWA plugin
npm install -D vite-plugin-pwa

# Install Workbox (for service worker)
npm install -D workbox-window
```

### 3. Install ShadCN UI

```bash
# Initialize ShadCN
npx shadcn@latest init

# When prompted:
# - Choose "Default" style
# - Choose base color (e.g., "Slate")
# - Answer "Yes" to CSS variables
```

### 4. Install Required ShadCN Components

```bash
# Install UI components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add checkbox
npx shadcn@latest add card
```

### 5. Install Testing Dependencies (Optional)

```bash
# Unit/Integration testing
npm install -D vitest @vitest/ui happy-dom
npm install -D @testing-library/dom @testing-library/user-event

# E2E testing
npm install -D @playwright/test

# Service worker mocking
npm install -D msw
```

---

## Configuration

### 1. Configure Vite for PWA

Create/update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'TODO PWA',
        short_name: 'TODO',
        description: 'A simple TODO Progressive Web Application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### 2. Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable", "WebWorker"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. Configure Vitest (Optional)

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### 4. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Generate PWA Icons

### Option 1: Auto-Generate

```bash
# Create a logo.svg in public/ directory
# Then run:
npx @vite-pwa/assets-generator --preset minimal public/logo.svg
```

### Option 2: Manual Creation

Create icons manually and place in `public/icons/`:
- `192.png` - 192×192px
- `512.png` - 512×512px
- `maskable-512.png` - 512×512px with 40% safe zone

---

## Project Structure

Create the following directory structure:

```
todo-pwa/
├── public/
│   ├── icons/
│   │   ├── 192.png
│   │   ├── 512.png
│   │   └── maskable-512.png
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/              # ShadCN components (auto-generated)
│   │   ├── TodoApp.tsx
│   │   ├── TodoForm.tsx
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoFilter.tsx
│   │   └── TodoStats.tsx
│   ├── services/
│   │   └── TodoStore.ts
│   ├── models/
│   │   └── Todo.ts
│   ├── lib/
│   │   └── utils.ts         # ShadCN utilities
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

Open browser to `http://localhost:5173`

### 2. Run Tests (Optional)

```bash
# Unit/Integration tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

### 3. Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### 4. Preview Production Build

```bash
npm run preview
```

### 5. Test PWA Features

1. Open Chrome DevTools
2. Go to "Application" tab
3. Check:
   - Manifest loads correctly
   - Service Worker registers
   - Assets are cached
4. Go offline (DevTools Network tab: "Offline")
5. Reload page - should still work

---

## Lighthouse PWA Audit

### Run Lighthouse Test

1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Check "Progressive Web App"
4. Click "Generate report"
5. Target: 100 score

### Common Issues

| Issue | Solution |
|-------|----------|
| No manifest | Check `vite.config.ts` manifest config |
| No service worker | Verify `vite-plugin-pwa` is installed |
| Icons missing | Generate icons in `public/icons/` |
| Not HTTPS | Deploy to hosting with HTTPS (Netlify, Vercel) |

---

## Deployment

### Option 1: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 3: GitHub Pages

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
# "deploy": "vite build && gh-pages -d dist"

# Deploy
npm run deploy
```

---

## Testing PWA Installation

### Desktop (Chrome)

1. Open your deployed PWA URL
2. Look for install icon in address bar
3. Click install
4. App opens in standalone window

### Mobile (Android)

1. Open PWA URL in Chrome
2. Tap menu (three dots)
3. Tap "Add to Home screen"
4. App appears on home screen

### Mobile (iOS)

1. Open PWA URL in Safari
2. Tap share button
3. Tap "Add to Home Screen"
4. App appears on home screen

---

## Troubleshooting

### Service Worker Not Registering

```bash
# Clear browser cache
# Check console for errors
# Verify HTTPS (required for service workers)
```

### PWA Not Installable

```bash
# Check manifest.json loads (DevTools > Application > Manifest)
# Verify all required icons exist
# Check Lighthouse report for specific issues
```

### TypeScript Errors

```bash
# Regenerate types
npm run build

# Check tsconfig.json is correct
```

### Build Fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

---

## Next Steps

1. ✅ Complete setup following this guide
2. ✅ Verify development server runs
3. ✅ Create TodoStore service (see `contracts/todo-store.md`)
4. ✅ Build UI components (see `contracts/ui-components.md`)
5. ✅ Add tests (see research.md for testing strategy)
6. ✅ Run Lighthouse audit (target: 100 PWA score)
7. ✅ Deploy to hosting platform
8. ✅ Test installation on mobile and desktop

---

## Helpful Resources

- [Vite Documentation](https://vitejs.dev/)
- [ShadCN UI Documentation](https://ui.shadcn.com/)
- [PWA Best Practices](https://web.dev/pwa/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review specification in `spec.md`
3. Check contracts in `contracts/` directory
4. Review research findings in `research.md`
