# E2E Testing with Playwright

**E2E patterns for test-writer and test-runner agents.**

## TDD: Tests BEFORE Implementation

1. **Red**: Write failing E2E test
2. **Green**: Implement UI
3. **Refactor**: Improve

## Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should do X when Y', async ({ page }) => {
    // Given
    const input = page.getByRole('textbox', { name: /label/i });
    // When
    await input.fill('data');
    await page.getByRole('button', { name: /submit/i }).click();
    // Then
    await expect(page.getByText('data')).toBeVisible();
  });
});
```

## Playwright MCP: Token Efficiency

### Use Snapshot NOT Screenshot

```typescript
// ❌ High tokens (image)
await page.screenshot();

// ✅ Low tokens (accessible tree)
playwright_browser_snapshot();
```

### Filter Logs and Network

```typescript
// ✅ Errors only
playwright_browser_console_messages({ level: 'error' });
playwright_browser_network_requests({ includeStatic: false });
```

### Batch Operations

```typescript
// ✅ One call for multiple fields
playwright_browser_fill_form({
  fields: [
    {
      name: 'Title',
      type: 'textbox',
      ref: 'input[name="title"]',
      value: 'Test',
    },
  ],
});
```

## Debugging Workflow

1. Run test (bash: `npx playwright test`)
2. On fail: `playwright_browser_snapshot()`
3. Check errors: `console_messages({ level: 'error' })`
4. Check network: `network_requests({ includeStatic: false })`
5. Fix and re-run

## Locators (Priority Order)

1. `getByRole('button', { name: /submit/i })`
2. `getByLabel(/email/i)`
3. `getByPlaceholder(/search/i)`
4. `getByText(/welcome/i)`
5. `getByTestId('id')` (last resort)

❌ Never: CSS selectors, XPath

## Patterns

### Batch Operations

```typescript
const tasks = ['Task 1', 'Task 2'];
for (const task of tasks) {
  await input.fill(task);
  await submitButton.click();
}
```

### Persistence

```typescript
// Create
await input.fill('test');
await submitButton.click();
// Reload
await page.reload();
// Verify
await expect(page.getByText('test')).toBeVisible();
```

### Offline (PWA)

```typescript
await page.goto('/');
await input.fill('task');
await submitButton.click();
// Go offline
await page.context().setOffline(true);
await page.reload();
await expect(page.getByText('task')).toBeVisible();
```

### Browser Context

```typescript
test('persist across sessions', async ({ context, page }) => {
  await input.fill('test');
  await submitButton.click();
  await page.close();
  const newPage = await context.newPage();
  await newPage.goto('/');
  await expect(newPage.getByText('test')).toBeVisible();
});
```

## Coverage

- Happy paths: All user flows
- Edge cases: Empty, whitespace, boundaries
- Error paths: Validation, network errors
- Persistence: LocalStorage, reload, restart
- Responsive: Mobile, tablet, desktop
- PWA: Offline, install, service worker

## Naming

```typescript
// ✅ Good
test('should create task when title is valid');
test('should persist task after reload');

// ❌ Bad
test('task creation');
test('test1');
```

## Token Optimization

| Action  | ❌ High         | ✅ Low      |
| ------- | --------------- | ----------- |
| Visual  | screenshot()    | snapshot()  |
| Logs    | all             | errors only |
| Network | all             | failed only |
| Forms   | multiple type() | fill_form() |
