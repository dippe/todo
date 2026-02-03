# Research: TODO PWA with Responsive Design

## Overview
This document consolidates research findings for implementing a TODO Progressive Web Application with responsive design, browser-only implementation, and in-memory storage.

---

## 1. UI Framework Selection

### Decision: **ShadCN UI with React + TypeScript**

**Rationale:**
- Fully compatible with PWAs (React + Tailwind + Radix UI)
- Meets constitution requirement for ShadCN
- Components are copied into project (full control, no external runtime dependencies)
- Excellent performance: 20-40KB bundle size for typical TODO app
- Works seamlessly with service workers and offline capability
- Built-in responsive design through Tailwind utilities

**Performance Impact:**
- Tailwind CSS: 5-15KB gzipped (with purging)
- ShadCN Components: 1-5KB per component (tree-shakeable)
- Radix UI primitives: 2-10KB per component
- Total estimated: 20-40KB (well under <2s load time goal)

**Alternatives Considered:**
- Material UI (80-150KB) - Too heavy
- Chakra UI (50-100KB) - Larger bundle
- Vanilla HTML/CSS (0-5KB) - Too much dev effort
- **Verdict:** ShadCN is optimal for constitution compliance + performance

---

## 2. Build Tool and PWA Setup

### Decision: **Vite + vite-plugin-pwa**

**Rationale:**
- Lightning-fast HMR (~100ms vs seconds in Webpack)
- Native TypeScript support (zero config)
- Simple configuration (~20 lines vs Webpack's 100+)
- Built-in code splitting and optimization
- `vite-plugin-pwa` automates service worker and manifest generation

**Configuration:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'TODO PWA',
        short_name: 'TODO',
        theme_color: '#ffffff',
        icons: [/* icons config */]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})
```

**Alternatives Considered:**
- Webpack - Too complex, slower dev experience
- Parcel - Less control, smaller ecosystem
- Rollup - More manual setup required
- **Verdict:** Vite provides best developer experience with minimal configuration

---

## 3. Testing Framework

### Decision: **Vitest + Testing Library + Playwright + MSW**

**Unit & Integration Tests: Vitest**
- Native TypeScript support (zero config)
- 10-100x faster than Jest
- Vite-powered (same transform pipeline as app)
- Jest-compatible API (familiar syntax)

**Component Testing: Testing Library**
- User-centric testing approach
- Encourages accessibility-first testing
- Framework-agnostic

**E2E Testing: Playwright**
- Multi-browser support (Chromium, Firefox, WebKit)
- PWA-specific features (test installation, offline mode)
- Mobile emulation for responsive testing
- Excellent TypeScript support

**Service Worker Testing: MSW (Mock Service Worker)**
- Network-level mocking
- Same mocks for dev and test
- Tests real fetch calls (no stubbing)

**Alternatives Considered:**
- Jest - Slower, more configuration for TypeScript
- Cypress - Slower, less browser coverage
- Puppeteer - Lower-level, Chrome-only
- **Verdict:** Vitest + Playwright provides comprehensive, fast testing with minimal setup

**Dependencies:**
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/dom": "^9.3.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.40.0",
    "msw": "^2.0.0",
    "happy-dom": "^12.0.0"
  }
}
```

---

## 4. PWA Architecture

### Manifest.json (Essential Fields)
```json
{
  "name": "TODO PWA",
  "short_name": "TODO",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Decision:** Minimal manifest with essential fields only
- 3 icons cover all modern browsers (192px, 512px, maskable)
- Old sizes (48px, 72px) no longer needed

### Service Worker Strategy

**Decision: Cache-first for static assets**
```javascript
// Minimal service worker pattern
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => 
      cache.addAll(['/', '/index.html', '/styles.css', '/app.js'])
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

**Rationale:**
- Simple, works offline immediately
- In-memory data doesn't need caching
- Minimal complexity

**Alternatives:**
- Network-first - Requires network connection
- Stale-while-revalidate - More complex
- **Verdict:** Cache-first is simplest for browser-only PWA

---

## 5. In-Memory State Management

### Decision: **Map-based class with observer pattern**

```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

class TodoStore {
  private todos: Map<string, Todo> = new Map();
  private listeners: Set<(todos: Todo[]) => void> = new Set();

  add(todo: Todo): void {
    this.todos.set(todo.id, todo);
    this.notify();
  }

  get(id: string): Todo | undefined {
    return this.todos.get(id);
  }

  getAll(): Todo[] {
    return Array.from(this.todos.values());
  }

  subscribe(listener: (todos: Todo[]) => void): void {
    this.listeners.add(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn(this.getAll()));
  }
}
```

**Rationale:**
- O(1) lookup/insert with Map
- No external dependencies
- Type-safe with TypeScript
- Simple observer pattern for UI updates
- Memory efficient: ~100 bytes/todo × 1000 = ~100KB

**Alternatives:**
- Redux - Overkill for simple TODO app
- Plain array - O(n) operations for lookups
- localStorage sync - Adds complexity against requirements
- **Verdict:** Map-based class is optimal balance

---

## 6. Responsive Design Approach

### Decision: **Mobile-first CSS with CSS Grid**

**Mobile-First Pattern:**
```css
/* Base styles (mobile) */
.container {
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    max-width: 960px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1200px) {
  .container {
    max-width: 1200px;
  }
}
```

**Grid Layout:**
```css
.todo-list {
  display: grid;
  gap: 1rem;
}

@media (min-width: 768px) {
  .todo-list {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
```

**Critical Meta Tag:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

**Rationale:**
- CSS Grid handles 2D layouts better than Flexbox
- Mobile-first ensures core experience works everywhere
- ShadCN/Tailwind provides responsive utilities out-of-box

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1199px
- Desktop: ≥ 1200px

**Alternatives:**
- Flexbox - Better for 1D layouts
- Float-based - Legacy approach
- **Verdict:** CSS Grid + mobile-first is modern standard

---

## 7. Module Bundling Strategy

### Decision: **Single bundle for initial implementation**

**Rationale:**
- TODO app expected to be <50KB total
- HTTP/2 makes multiple requests fast
- Simpler deployment
- Easier debugging

**When to Split:**
- If bundle exceeds 100KB
- If adding multiple routes/features
- Use dynamic imports: `const feature = () => import('./feature.js')`

**Performance Budget:**
- Target: <50KB gzipped JavaScript
- Current estimate: ~22KB total
- Monitor with bundle size plugin

---

## 8. Icon Requirements

### Decision: **3 PNG icons (auto-generated)**

**Required Sizes:**
- 192×192px - Android home screen
- 512×512px - Android splash screen  
- 512×512px maskable - Adaptive icon with safe zone

**Generation Tool:**
```bash
npx @vite-pwa/assets-generator --preset minimal public/logo.svg
```

**Rationale:**
- Covers all modern browsers
- Auto-generation ensures consistency
- Maskable format prevents cropping issues

**Alternatives:**
- Manual export - Time-consuming, error-prone
- More sizes - No longer needed for modern browsers
- **Verdict:** Auto-generate 3 icons from SVG source

---

## 9. TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "WebWorker"],
    "types": ["vite/client"],
    "strict": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```

**Key Settings:**
- `strict: true` - Enforces type safety (constitution requirement)
- `lib: ["WebWorker"]` - Enables service worker types
- `moduleResolution: "bundler"` - Optimized for Vite

---

## 10. Final Technology Stack

### Core Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0",
    "@testing-library/dom": "^9.3.0",
    "msw": "^2.0.0"
  }
}
```

**Zero Runtime Dependencies Beyond React**
- Total production bundle: ~22KB gzipped
- ShadCN components copied into src/ (not dependencies)

### Development Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

---

## Performance Estimates

| Metric | Target | Expected | Status |
|--------|--------|----------|--------|
| Initial Load | <2s | ~1s | ✅ |
| Bundle Size | <100KB | ~22KB | ✅ |
| Animation | 60fps | 60fps | ✅ |
| Interaction | <100ms | <50ms | ✅ |

---

## Security Considerations

1. **Minimal Dependencies** - Reduces attack surface
2. **Browser-only** - No backend vulnerabilities
3. **HTTPS Required** - PWA requires secure context
4. **Content Security Policy** - Recommended for production
5. **No Sensitive Data** - In-memory only, clears on close

---

## Compliance with Constitution

### ✅ I. Simplicity and Minimalism
- Minimal dependencies (React + Vite + PWA plugin)
- No complex frameworks or patterns
- Clear, straightforward architecture

### ✅ II. Single Responsibility Orientation
- Clear module separation (components, services, models)
- Single entry point per module
- Standalone directories

### ✅ III. Code Quality Assurance
- TypeScript strict mode
- Linting (to be configured)
- Clear naming conventions

### ✅ IV. Testing Excellence
- TDD with Vitest + Playwright
- Unit, integration, and e2e coverage
- Service worker testing with MSW

### ✅ V. User Experience Consistency
- ShadCN for uniform UI components
- Responsive design for all devices
- Consistent interactions

### ✅ VI. Performance Optimization
- <2s load time (estimated <1s)
- 60fps animations
- Efficient in-memory storage

### ✅ VII. Security Compliance
- Minimal dependencies vetted
- Browser-only reduces attack surface
- HTTPS enforcement

---

## Quick Start Checklist

- [ ] Initialize: `npm create vite@latest todo-pwa -- --template react-ts`
- [ ] Install ShadCN: `npx shadcn@latest init`
- [ ] Add PWA: `npm i -D vite-plugin-pwa`
- [ ] Configure vite.config.ts with PWA plugin
- [ ] Generate icons from logo.svg
- [ ] Set up testing (Vitest + Playwright)
- [ ] Implement TodoStore with Map
- [ ] Build UI components with ShadCN
- [ ] Test with Lighthouse (target: 100 PWA score)
- [ ] Deploy to static hosting (Netlify/Vercel)

---

## Next Phase

All NEEDS CLARIFICATION items resolved:
1. ✅ UI Framework: ShadCN with React + TypeScript
2. ✅ Testing: Vitest + Testing Library + Playwright + MSW
3. ✅ Build Tool: Vite + vite-plugin-pwa
4. ✅ Architecture: Map-based store, cache-first SW, mobile-first CSS

**Ready to proceed to Phase 1: Design & Contracts**
