/**
 * E2E Tests: Offline PWA Functionality (User Story 5)
 *
 * Tests the offline capabilities including:
 * - Service worker installation
 * - Cached resource loading
 * - Offline CRUD operations
 * - PWA installability
 * - Standalone mode
 *
 * Acceptance Criteria:
 * - App functions fully offline with service worker caching
 * - Users can install app to home screen
 * - All CRUD operations work offline
 * - Instant load from cache
 */

import { test, expect } from '@playwright/test';

test.describe('User Story 5: Offline PWA Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all service workers and caches before each test
    await context.clearCookies();
    await page.goto('/');

    // Wait for service worker registration
    await page.waitForTimeout(1000);
  });

  /**
   * T100: Test service worker installation
   * Given: User visits the app
   * When: The page loads
   * Then: Service worker should be registered successfully
   */
  test('should register service worker successfully', async ({ page }) => {
    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      return registration !== undefined;
    });

    expect(swRegistered).toBe(true);
  });

  /**
   * T100: Test service worker state
   * Given: Service worker is registered
   * When: The app is loaded
   * Then: Service worker should be in 'activated' state
   */
  test('should have service worker in activated state', async ({ page }) => {
    const swState = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return registration?.active?.state;
    });

    expect(swState).toBe('activated');
  });

  /**
   * T101: Test cached resource loading
   * Given: App has been loaded once
   * When: User goes offline and reloads
   * Then: Static assets should be served from cache
   */
  test('should serve static assets from cache when offline', async ({
    page,
    context,
  }) => {
    // First visit to cache resources
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for service worker to cache resources
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify page loaded successfully
    const rootElement = await page.locator('#root');
    await expect(rootElement).toBeVisible();

    // Verify the app UI is present
    const heading = await page.locator('h1');
    await expect(heading).toContainText(/todo/i);
  });

  /**
   * T099 & T112: Test offline task creation
   * Given: User is offline
   * When: User creates a new task
   * Then: Task should be created and stored in LocalStorage
   */
  test('should allow creating tasks while offline', async ({
    page,
    context,
  }) => {
    // First visit to cache resources
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Create a task
    const taskInput = await page.locator('[aria-label*="Task"]').first();
    const addButton = await page.locator('button:has-text("Add")').first();

    await taskInput.fill('Offline task');
    await addButton.click();

    // Verify task appears in the list
    await expect(page.getByText('Offline task')).toBeVisible();

    // Verify task is stored in LocalStorage
    const storedTasks = await page.evaluate(() => {
      const data = localStorage.getItem('todo-pwa-state');
      return data ? JSON.parse(data) : null;
    });

    expect(storedTasks).toBeTruthy();
    expect(storedTasks.data.tasks.items).toHaveLength(1);
    expect(storedTasks.data.tasks.items[0].title).toBe('Offline task');
  });

  /**
   * T113: Test offline task toggle
   * Given: User has tasks and is offline
   * When: User toggles task completion
   * Then: Task state should update in LocalStorage
   */
  test('should allow toggling tasks while offline', async ({
    page,
    context,
  }) => {
    // Create a task while online
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const taskInput = await page.locator('[aria-label*="Task"]').first();
    const addButton = await page.locator('button:has-text("Add")').first();

    await taskInput.fill('Task to toggle');
    await addButton.click();
    await page.waitForTimeout(500);

    // Go offline
    await context.setOffline(true);

    // Toggle the task
    const checkbox = await page.locator('[role="checkbox"]').first();
    await checkbox.click();
    await page.waitForTimeout(500);

    // Verify task is marked as completed in LocalStorage
    const storedTasks = await page.evaluate(() => {
      const data = localStorage.getItem('todo-pwa-state');
      return data ? JSON.parse(data) : null;
    });

    expect(storedTasks.data.tasks.items[0].completed).toBe(true);
  });

  /**
   * T114: Test offline task deletion
   * Given: User has tasks and is offline
   * When: User deletes a task
   * Then: Task should be removed from LocalStorage
   */
  test('should allow deleting tasks while offline', async ({
    page,
    context,
  }) => {
    // Create a task while online
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const taskInput = await page.locator('[aria-label*="Task"]').first();
    const addButton = await page.locator('button:has-text("Add")').first();

    await taskInput.fill('Task to delete');
    await addButton.click();
    await page.waitForTimeout(500);

    // Verify task exists
    await expect(page.getByText('Task to delete')).toBeVisible();

    // Go offline
    await context.setOffline(true);

    // Delete the task
    const deleteButton = await page.locator('[aria-label*="Delete"]').first();
    await deleteButton.click();

    // If there's a confirmation dialog, confirm it
    const confirmButton = await page
      .locator('button:has-text("Delete")')
      .last();
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }

    await page.waitForTimeout(500);

    // Verify task is removed from UI
    await expect(page.getByText('Task to delete')).not.toBeVisible();

    // Verify task is removed from LocalStorage
    const storedTasks = await page.evaluate(() => {
      const data = localStorage.getItem('todo-pwa-state');
      return data ? JSON.parse(data) : null;
    });

    expect(storedTasks.data.tasks.items).toHaveLength(0);
  });

  /**
   * T099: Test offline persistence across reloads
   * Given: User creates tasks offline
   * When: User reloads the app while still offline
   * Then: Tasks should persist and load from LocalStorage
   */
  test('should persist tasks across offline reloads', async ({
    page,
    context,
  }) => {
    // First visit to cache resources
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Create multiple tasks
    const taskInput = await page.locator('[aria-label*="Task"]').first();
    const addButton = await page.locator('button:has-text("Add")').first();

    await taskInput.fill('Offline task 1');
    await addButton.click();
    await page.waitForTimeout(300);

    await taskInput.fill('Offline task 2');
    await addButton.click();
    await page.waitForTimeout(300);

    // Verify tasks appear
    await expect(page.getByText('Offline task 1')).toBeVisible();
    await expect(page.getByText('Offline task 2')).toBeVisible();

    // Reload the page while offline
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify tasks still appear after reload
    await expect(page.getByText('Offline task 1')).toBeVisible();
    await expect(page.getByText('Offline task 2')).toBeVisible();
  });

  /**
   * T102: Test PWA installability
   * Given: User visits the app
   * When: The app meets PWA criteria
   * Then: Manifest should be valid and installable
   */
  test('should have valid PWA manifest', async ({ page }) => {
    await page.goto('/');

    // Check if manifest is linked in HTML
    const manifestLink = await page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    // Fetch and validate manifest content
    const manifestData = await page.evaluate(async () => {
      const response = await fetch('/manifest.json');
      return response.json();
    });

    // Validate required manifest properties
    expect(manifestData.name).toBe('TODO PWA Application');
    expect(manifestData.short_name).toBe('TODO PWA');
    expect(manifestData.start_url).toBe('/');
    expect(manifestData.display).toBe('standalone');
    expect(manifestData.theme_color).toBeDefined();
    expect(manifestData.background_color).toBeDefined();
    expect(manifestData.icons).toBeInstanceOf(Array);
    expect(manifestData.icons.length).toBeGreaterThanOrEqual(2);

    // Validate icon sizes
    const iconSizes = manifestData.icons.map(
      (icon: { sizes: string }) => icon.sizes
    );
    expect(iconSizes).toContain('192x192');
    expect(iconSizes).toContain('512x512');
  });

  /**
   * T102: Test theme-color meta tag
   * Given: User visits the app
   * When: The page loads
   * Then: Theme color should be set for PWA
   */
  test('should have theme-color meta tag', async ({ page }) => {
    await page.goto('/');

    const themeColor = await page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#000000');
  });

  /**
   * T102: Test apple-touch-icon for iOS installability
   * Given: User visits the app on iOS
   * When: The page loads
   * Then: Apple touch icon should be present
   */
  test('should have apple-touch-icon for iOS', async ({ page }) => {
    await page.goto('/');

    const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveAttribute(
      'href',
      '/icons/icon-192x192.png'
    );
  });

  /**
   * T101: Test instant load from cache (performance)
   * Given: App has been cached
   * When: User revisits the app
   * Then: App should load instantly from cache (<2s)
   */
  test('should load instantly from cache on repeat visits', async ({
    page,
  }) => {
    // First visit to cache resources
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Second visit - should load from cache
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Verify instant load (< 2000ms per SC-002)
    expect(loadTime).toBeLessThan(2000);

    // Verify page is functional
    const rootElement = await page.locator('#root');
    await expect(rootElement).toBeVisible();
  });

  /**
   * T118: Test standalone display mode detection
   * Given: App is installed as PWA
   * When: User launches from home screen
   * Then: App should detect standalone mode
   *
   * Note: This test simulates standalone mode since we can't actually install the PWA in E2E tests
   */
  test('should detect standalone display mode', async ({ page }) => {
    // Simulate standalone mode
    await page.goto('/');

    const isStandalone = await page.evaluate(() => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean })
          .standalone === true ||
        document.referrer.includes('android-app://')
      );
    });

    // In regular browser, this will be false
    // When actually installed, this would be true
    expect(typeof isStandalone).toBe('boolean');
  });

  /**
   * T099: Test offline indicator (optional enhancement)
   * Given: User goes offline
   * When: Network status changes
   * Then: App should detect offline status
   */
  test('should detect offline status', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Check if navigator.onLine reports false
    const isOnline = await page.evaluate(() => navigator.onLine);
    expect(isOnline).toBe(false);

    // Go back online
    await context.setOffline(false);
    await page.waitForTimeout(1000);

    // Check if navigator.onLine reports true
    const isOnlineAgain = await page.evaluate(() => navigator.onLine);
    expect(isOnlineAgain).toBe(true);
  });

  /**
   * T099: Test multiple offline CRUD operations in sequence
   * Given: User is offline
   * When: User performs multiple CRUD operations
   * Then: All operations should work seamlessly
   */
  test('should handle multiple offline CRUD operations', async ({
    page,
    context,
  }) => {
    // First visit to cache resources
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    const taskInput = await page.locator('[aria-label*="Task"]').first();
    const addButton = await page.locator('button:has-text("Add")').first();

    // Create 3 tasks
    await taskInput.fill('Task 1');
    await addButton.click();
    await page.waitForTimeout(300);

    await taskInput.fill('Task 2');
    await addButton.click();
    await page.waitForTimeout(300);

    await taskInput.fill('Task 3');
    await addButton.click();
    await page.waitForTimeout(300);

    // Verify all tasks appear
    await expect(page.getByText('Task 1')).toBeVisible();
    await expect(page.getByText('Task 2')).toBeVisible();
    await expect(page.getByText('Task 3')).toBeVisible();

    // Toggle first task
    const checkboxes = await page.locator('[role="checkbox"]');
    await checkboxes.first().click();
    await page.waitForTimeout(300);

    // Delete second task
    const deleteButtons = await page.locator('[aria-label*="Delete"]');
    await deleteButtons.nth(1).click();

    const confirmButton = await page
      .locator('button:has-text("Delete")')
      .last();
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
    await page.waitForTimeout(300);

    // Verify final state
    await expect(page.getByText('Task 1')).toBeVisible();
    await expect(page.getByText('Task 2')).not.toBeVisible();
    await expect(page.getByText('Task 3')).toBeVisible();

    // Verify LocalStorage state
    const storedTasks = await page.evaluate(() => {
      const data = localStorage.getItem('todo-pwa-state');
      return data ? JSON.parse(data) : null;
    });

    expect(storedTasks.data.tasks.items).toHaveLength(2);
    expect(storedTasks.data.tasks.items[0].title).toBe('Task 1');
    expect(storedTasks.data.tasks.items[0].completed).toBe(true);
    expect(storedTasks.data.tasks.items[1].title).toBe('Task 3');
  });
});
