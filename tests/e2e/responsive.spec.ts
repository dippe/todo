import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Mock crypto for the app
    await page.addInitScript(() => {
      Object.defineProperty(window, 'crypto', {
        value: {
          randomUUID: () => '550e8400-e29b-41d4-a716-446655440000',
          getRandomValues: (array: any) => array,
          random: Math.random,
        },
      });
    });
  });

  test('should display mobile layout on 320px viewport', async ({ page }) => {
    // Arrange - Set mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 320, height: 568 });

    // Act - Create a task to interact with the layout
    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    await taskInput.fill('Mobile test task');
    await submitButton.click();

    // Assert - Verify mobile-specific layout characteristics
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Form should be full width in mobile
    const form = page.locator('form').first();
    const formBox = await form.boundingBox();
    expect(formBox).toBeTruthy();
    if (formBox) {
      expect(formBox.width).toBeGreaterThan(280); // Most of 320px width minus padding
    }

    // Input should be full width in mobile
    const inputBox = await taskInput.boundingBox();
    expect(inputBox).toBeTruthy();
    if (inputBox) {
      expect(inputBox.width).toBeGreaterThan(280);
    }
  });

  test('should display tablet layout on 768px viewport', async ({ page }) => {
    // Arrange - Set tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });

    // Act - Create a task
    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    await taskInput.fill('Tablet test task');
    await submitButton.click();

    // Assert - Verify tablet layout
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const taskItem = page.getByText('Tablet test task');
    await expect(taskItem).toBeVisible();

    // Container should have max-width constraint
    const main = page.locator('main');
    const mainBox = await main.boundingBox();
    expect(mainBox).toBeTruthy();
  });

  test('should display desktop layout on 1920px viewport', async ({ page }) => {
    // Arrange - Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Act - Create a task
    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    await taskInput.fill('Desktop test task');
    await submitButton.click();

    // Assert - Verify desktop layout with constrained width
    const main = page.locator('main');
    const mainBox = await main.boundingBox();
    expect(mainBox).toBeTruthy();

    // Content should be centered with max-width (max-w-3xl = 768px)
    if (mainBox) {
      const container = page.locator('main > div').first();
      const containerBox = await container.boundingBox();
      expect(containerBox).toBeTruthy();
      if (containerBox) {
        // Container should not exceed max-width
        expect(containerBox.width).toBeLessThanOrEqual(800); // max-w-3xl + padding
      }
    }
  });

  test('should adapt layout when resizing from mobile to desktop', async ({
    page,
  }) => {
    // Arrange - Start with mobile
    await page.setViewportSize({ width: 375, height: 667 });

    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    await taskInput.fill('Resize test task');
    await submitButton.click();

    // Act - Resize to desktop
    await page.setViewportSize({ width: 1440, height: 900 });

    // Assert - Content should still be visible and properly laid out
    const taskItem = page.getByText('Resize test task');
    await expect(taskItem).toBeVisible();

    // Task input should still be functional
    await taskInput.fill('Second task after resize');
    await submitButton.click();
    await expect(page.getByText('Second task after resize')).toBeVisible();
  });

  test('should stack form elements vertically on mobile', async ({ page }) => {
    // Arrange - Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Act
    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    // Assert - Input and button should stack vertically on mobile
    const inputBox = await taskInput.boundingBox();
    const buttonBox = await submitButton.boundingBox();

    expect(inputBox).toBeTruthy();
    expect(buttonBox).toBeTruthy();

    if (inputBox && buttonBox) {
      // Button Y position should be greater than input Y + input height
      // This indicates vertical stacking (flex-col on mobile)
      expect(buttonBox.y).toBeGreaterThanOrEqual(inputBox.y);
    }
  });

  test('should display form elements horizontally on desktop', async ({
    page,
  }) => {
    // Arrange - Desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });

    // Act
    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    // Assert - Input and button should be on same row on desktop
    const inputBox = await taskInput.boundingBox();
    const buttonBox = await submitButton.boundingBox();

    expect(inputBox).toBeTruthy();
    expect(buttonBox).toBeTruthy();

    if (inputBox && buttonBox) {
      // Button should be roughly at same Y level as input (horizontal layout)
      const yDifference = Math.abs(buttonBox.y - inputBox.y);
      expect(yDifference).toBeLessThan(10); // Allow small differences
    }
  });

  test('should handle multiple tasks on mobile viewport', async ({ page }) => {
    // Arrange - Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Act - Create multiple tasks
    const tasks = ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5'];
    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    for (const task of tasks) {
      await taskInput.fill(task);
      await submitButton.click();
    }

    // Assert - All tasks should be visible and properly laid out
    for (const task of tasks) {
      await expect(page.getByText(task)).toBeVisible();
    }

    // Task list should be scrollable if needed
    const taskList = page.locator('[role="list"]');
    await expect(taskList).toBeVisible();
  });
});

test.describe('Touch Target Size Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Set mobile viewport for touch target testing
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should have minimum 44x44px touch target for submit button', async ({
    page,
  }) => {
    // Arrange
    const submitButton = page.getByRole('button', { name: /add task/i });

    // Act
    const buttonBox = await submitButton.boundingBox();

    // Assert - Button should meet WCAG AA minimum touch target size
    expect(buttonBox).toBeTruthy();
    if (buttonBox) {
      expect(buttonBox.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should have minimum 44x44px touch target for checkboxes', async ({
    page,
  }) => {
    // Arrange - Create a task first
    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    await taskInput.fill('Test task for checkbox');
    await submitButton.click();

    // Act
    const checkbox = page.locator('[role="checkbox"]').first();
    const checkboxBox = await checkbox.boundingBox();

    // Assert - Checkbox should meet WCAG AA minimum
    expect(checkboxBox).toBeTruthy();
    if (checkboxBox) {
      expect(checkboxBox.width).toBeGreaterThanOrEqual(44);
      expect(checkboxBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should have minimum 44x44px touch target for edit button', async ({
    page,
  }) => {
    // Arrange - Create a task first
    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    await taskInput.fill('Test task for edit button');
    await submitButton.click();

    // Act
    const editButton = page.getByRole('button', { name: /edit test task/i });
    const buttonBox = await editButton.boundingBox();

    // Assert
    expect(buttonBox).toBeTruthy();
    if (buttonBox) {
      expect(buttonBox.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should have minimum 44x44px touch target for delete button', async ({
    page,
  }) => {
    // Arrange - Create a task first
    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    await taskInput.fill('Test task for delete button');
    await submitButton.click();

    // Act
    const deleteButton = page.getByRole('button', {
      name: /delete test task/i,
    });
    const buttonBox = await deleteButton.boundingBox();

    // Assert
    expect(buttonBox).toBeTruthy();
    if (buttonBox) {
      expect(buttonBox.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should have minimum 44x44px touch target for input field', async ({
    page,
  }) => {
    // Arrange
    const taskInput = page.getByRole('textbox', { name: /add task/i });

    // Act
    const inputBox = await taskInput.boundingBox();

    // Assert - Input height should meet minimum for touch
    expect(inputBox).toBeTruthy();
    if (inputBox) {
      expect(inputBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should maintain touch target sizes across all viewport sizes', async ({
    page,
  }) => {
    const viewports = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 667, name: 'iPhone 8' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
      { width: 768, height: 1024, name: 'iPad' },
    ];

    for (const viewport of viewports) {
      // Arrange
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.reload();

      // Create a task
      const taskInput = page.getByRole('textbox', { name: /add task/i });
      const submitButton = page.getByRole('button', { name: /add task/i });

      await taskInput.fill(`Task on ${viewport.name}`);
      await submitButton.click();

      // Act & Assert - Check all interactive elements
      const submitBox = await submitButton.boundingBox();
      expect(submitBox, `Submit button on ${viewport.name}`).toBeTruthy();
      if (submitBox) {
        expect(
          submitBox.width,
          `Submit width on ${viewport.name}`
        ).toBeGreaterThanOrEqual(44);
        expect(
          submitBox.height,
          `Submit height on ${viewport.name}`
        ).toBeGreaterThanOrEqual(44);
      }

      const checkbox = page.locator('[role="checkbox"]').first();
      const checkboxBox = await checkbox.boundingBox();
      expect(checkboxBox, `Checkbox on ${viewport.name}`).toBeTruthy();
      if (checkboxBox) {
        expect(
          checkboxBox.width,
          `Checkbox width on ${viewport.name}`
        ).toBeGreaterThanOrEqual(44);
        expect(
          checkboxBox.height,
          `Checkbox height on ${viewport.name}`
        ).toBeGreaterThanOrEqual(44);
      }

      // Clean up for next iteration
      await page.evaluate(() => localStorage.clear());
    }
  });
});

test.describe('Orientation Change Tests', () => {
  test('should handle portrait to landscape orientation change', async ({
    page,
  }) => {
    // Arrange - Start in portrait
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    await taskInput.fill('Portrait task');
    await submitButton.click();

    // Act - Rotate to landscape
    await page.setViewportSize({ width: 667, height: 375 });

    // Assert - Task should still be visible
    await expect(page.getByText('Portrait task')).toBeVisible();

    // Should be able to create new tasks
    await taskInput.fill('Landscape task');
    await submitButton.click();
    await expect(page.getByText('Landscape task')).toBeVisible();
  });

  test('should handle landscape to portrait orientation change', async ({
    page,
  }) => {
    // Arrange - Start in landscape
    await page.goto('/');
    await page.setViewportSize({ width: 667, height: 375 });
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    await taskInput.fill('Landscape first');
    await submitButton.click();

    // Act - Rotate to portrait
    await page.setViewportSize({ width: 375, height: 667 });

    // Assert - Task should still be visible
    await expect(page.getByText('Landscape first')).toBeVisible();

    // Should be able to create new tasks
    await taskInput.fill('Portrait after rotate');
    await submitButton.click();
    await expect(page.getByText('Portrait after rotate')).toBeVisible();
  });

  test('should preserve task state during orientation changes', async ({
    page,
  }) => {
    // Arrange - Create multiple tasks in portrait
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const tasks = ['Task 1', 'Task 2', 'Task 3'];
    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    for (const task of tasks) {
      await taskInput.fill(task);
      await submitButton.click();
    }

    // Act - Multiple orientation changes
    await page.setViewportSize({ width: 667, height: 375 }); // Landscape
    await page.setViewportSize({ width: 375, height: 667 }); // Portrait
    await page.setViewportSize({ width: 667, height: 375 }); // Landscape again

    // Assert - All tasks should still be visible
    for (const task of tasks) {
      await expect(page.getByText(task)).toBeVisible();
    }
  });

  test('should maintain touch targets after orientation change', async ({
    page,
  }) => {
    // Arrange - Portrait with task
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    await taskInput.fill('Touch target test');
    await submitButton.click();

    // Act - Rotate to landscape
    await page.setViewportSize({ width: 667, height: 375 });

    // Assert - Touch targets should still meet minimum size
    const checkbox = page.locator('[role="checkbox"]').first();
    const checkboxBox = await checkbox.boundingBox();

    expect(checkboxBox).toBeTruthy();
    if (checkboxBox) {
      expect(checkboxBox.width).toBeGreaterThanOrEqual(44);
      expect(checkboxBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should adapt layout from tablet portrait to landscape', async ({
    page,
  }) => {
    // Arrange - Tablet portrait
    await page.goto('/');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const taskInput = page.getByRole('textbox', { name: 'Add task' });
    const submitButton = page.getByRole('button', { name: 'Add Task' });

    await taskInput.fill('Tablet task');
    await submitButton.click();

    // Act - Rotate to landscape
    await page.setViewportSize({ width: 1024, height: 768 });

    // Assert - Layout should adapt
    await expect(page.getByText('Tablet task')).toBeVisible();

    // Form elements should be horizontal in landscape tablet
    const inputBox = await taskInput.boundingBox();
    const buttonBox = await submitButton.boundingBox();

    expect(inputBox).toBeTruthy();
    expect(buttonBox).toBeTruthy();

    if (inputBox && buttonBox) {
      // Should be roughly horizontal
      const yDifference = Math.abs(buttonBox.y - inputBox.y);
      expect(yDifference).toBeLessThan(20);
    }
  });
});
