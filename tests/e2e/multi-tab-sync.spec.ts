import { test, expect } from '@playwright/test';

test.describe('Multi-tab Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.waitForTimeout(500); // Wait for persistence
    await page.reload();
    // Mock crypto for the app
    await page.addInitScript(() => {
      (window as any).crypto = {
        randomUUID: () => '550e8400-e29b-41d4-a716-446655440000',
      };
    });
  });

  test('should sync created task across tabs', async ({ page, context }) => {
    // Arrange
    const taskTitle = 'Sync created task';
    const taskInputA = page.getByRole('textbox', { name: /add task/i });
    const submitButtonA = page.getByRole('button', { name: /add task/i });

    // Open second tab
    const pageB = await context.newPage();
    await pageB.goto('/');

    // Act - Create task in Tab A
    await taskInputA.fill(taskTitle);
    await submitButtonA.click();
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Assert - Task appears in Tab B
    await expect(pageB.getByText(taskTitle)).toBeVisible();
  });

  test('should sync task completion toggling across tabs', async ({
    page,
    context,
  }) => {
    // Arrange
    const taskTitle = 'Sync toggle task';
    const taskInputA = page.getByRole('textbox', { name: /add task/i });
    const submitButtonA = page.getByRole('button', { name: /add task/i });

    // Create task in Tab A
    await taskInputA.fill(taskTitle);
    await submitButtonA.click();
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Open second tab
    const pageB = await context.newPage();
    await pageB.goto('/');

    // Verify task exists in Tab B
    await expect(pageB.getByText(taskTitle)).toBeVisible();

    const checkboxA = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });
    const checkboxB = pageB.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });

    // Act - Toggle in Tab B
    await checkboxB.click();
    await expect(checkboxB).toBeChecked();

    // Assert - Updates in Tab A
    await expect(checkboxA).toBeChecked();

    // Act - Toggle back in Tab B
    await checkboxB.click();
    await expect(checkboxB).not.toBeChecked();

    // Assert - Updates in Tab A
    await expect(checkboxA).not.toBeChecked();
  });

  test('should sync task deletion across tabs', async ({ page, context }) => {
    // Arrange
    const taskTitle = 'Sync delete task';
    const taskInputA = page.getByRole('textbox', { name: /add task/i });
    const submitButtonA = page.getByRole('button', { name: /add task/i });

    // Create task in Tab A
    await taskInputA.fill(taskTitle);
    await submitButtonA.click();
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Open second tab
    const pageB = await context.newPage();
    await pageB.goto('/');

    // Verify task exists in Tab B
    await expect(pageB.getByText(taskTitle)).toBeVisible();

    // Act - Delete in Tab A
    const deleteButtonA = page.getByRole('button', {
      name: new RegExp(`delete.*${taskTitle}`, 'i'),
    });
    await deleteButtonA.click();
    await expect(page.getByText(taskTitle)).not.toBeVisible();

    // Assert - Disappears from Tab B
    await expect(pageB.getByText(taskTitle)).not.toBeVisible();
  });
});
