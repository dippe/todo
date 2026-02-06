import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Storage Export/Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    // Mock crypto to ensure consistent UUIDs if needed, though not strictly required for this test
    // but good for stability
    await page.addInitScript(() => {
      if (!window.crypto) {
        Object.defineProperty(window, 'crypto', {
          value: {
            randomUUID: () => '550e8400-e29b-41d4-a716-446655440000',
          },
        });
      } else if (!window.crypto.randomUUID) {
        // @ts-ignore
        window.crypto.randomUUID = () => '550e8400-e29b-41d4-a716-446655440000';
      }
    });
    await page.reload();
  });

  test('should verify export and import functionality', async ({ page }) => {
    const taskName = 'Task to Export';

    // 1. Navigate to the app (covered in beforeEach)

    // 2. Add a unique task "Task to Export"
    const input = page.getByRole('textbox', { name: /add task/i });
    await input.fill(taskName);
    await page.getByRole('button', { name: /add task/i }).click();
    await expect(page.getByText(taskName)).toBeVisible();

    // 3. Click "Export Tasks"
    // Handle the download event
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export tasks/i }).click();
    const download = await downloadPromise;

    // Verify the download filename contains 'todo-backup'
    expect(download.suggestedFilename()).toContain('todo-backup');

    // Save the downloaded path
    const downloadPath = await download.path();

    // 4. Delete the "Task to Export"
    // Assuming the task list has a delete button for the item
    // We use first() in case there are other elements, but strictly there should be one task
    await page.getByRole('button', { name: /delete/i }).click();

    // Verify it's gone
    await expect(page.getByText(taskName)).toBeHidden();

    // 5. Click "Import Tasks" (upload the saved file)
    // Handle the file chooser
    const fileChooserPromise = page.waitForEvent('filechooser');

    // The Import button might be rendered as a label (shadcn asChild pattern)
    // so we click the text if getByRole button fails, but let's try text first to be safe
    // or use the label associated with the file input
    await page.getByText(/import tasks/i).click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(downloadPath);

    // 6. Verify "Task to Export" reappears in the list
    await expect(page.getByText(taskName)).toBeVisible();

    // 7. Verify success notification
    // Assuming a toast or alert appears with success message
    await expect(page.getByText(/imported successfully/i)).toBeVisible();
  });
});
