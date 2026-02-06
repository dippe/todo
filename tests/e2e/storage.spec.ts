import { test, expect } from '@playwright/test';

test.describe('Storage Flow', () => {
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

  test('should export and import tasks', async ({ page }) => {
    // Arrange
    const taskTitle = 'Task to Export';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    // Act - Create task
    await taskInput.fill(taskTitle);
    await submitButton.click();
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Act - Export
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export tasks/i }).click();
    const download = await downloadPromise;

    // Assert - Download filename
    expect(download.suggestedFilename()).toContain('todo-backup');

    // Get download path for re-upload
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    // Act - Delete task to clear state
    const taskItem = page.getByRole('listitem').filter({ hasText: taskTitle });
    await taskItem.getByRole('button', { name: /delete/i }).click();
    await expect(page.getByText(taskTitle)).toBeHidden();

    // Act - Import
    // Locate the hidden file input by its ID as seen in StorageControls.tsx
    await page.setInputFiles('#import-tasks-input', downloadPath!);

    // Assert - Task restored
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Assert - Success notification
    await expect(page.getByRole('alert')).toContainText(
      'Tasks imported successfully'
    );
  });
});
