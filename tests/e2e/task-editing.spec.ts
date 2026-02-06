import { test, expect } from '@playwright/test';

test.describe('Task Editing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to ensure clean state
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

  test('should open edit dialog when clicking edit button', async ({
    page,
  }) => {
    // Arrange - Create a task
    const taskTitle = 'Edit me';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Click edit button
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    // Assert - Edit dialog should be visible
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
  });

  test('should display current task text in edit dialog', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Original task text';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Open edit dialog
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    // Assert - Dialog input should contain original text
    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await expect(dialogInput).toHaveValue(taskTitle);
  });

  test('should save edited task text', async ({ page }) => {
    // Arrange - Create a task
    const originalTitle = 'Buy milk';
    const editedTitle = 'Buy almond milk';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(originalTitle);
    await submitButton.click();

    // Act - Edit the task
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${originalTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill(editedTitle);

    const saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await saveButton.click();

    // Assert - Updated text should be visible, original should not
    await expect(page.getByText(editedTitle)).toBeVisible();
    await expect(page.getByText(originalTitle)).not.toBeVisible();
  });

  test('should close dialog after saving', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Test task';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Edit and save
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill('Updated task');

    const saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await saveButton.click();

    // Assert - Dialog should be closed
    const dialog = page.getByRole('dialog');
    await expect(dialog).not.toBeVisible();
  });

  test('should persist edited task after page reload', async ({ page }) => {
    // Arrange - Create a task
    const originalTitle = 'Original text';
    const editedTitle = 'Edited text persisted';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(originalTitle);
    await submitButton.click();

    // Act - Edit the task
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${originalTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill(editedTitle);

    const saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await saveButton.click();

    // Reload page
    await page.waitForTimeout(500); // Wait for persistence
    await page.reload();

    // Assert - Edited text should persist
    await expect(page.getByText(editedTitle)).toBeVisible();
    await expect(page.getByText(originalTitle)).not.toBeVisible();
  });

  test('should allow multiple edits on same task', async ({ page }) => {
    // Arrange - Create a task
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill('Version 1');
    await submitButton.click();

    // Act - First edit
    let editButton = page.getByRole('button', { name: /edit.*version 1/i });
    await editButton.click();

    let dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill('Version 2');

    let saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await saveButton.click();

    await expect(page.getByText('Version 2')).toBeVisible();

    // Act - Second edit
    editButton = page.getByRole('button', { name: /edit.*version 2/i });
    await editButton.click();

    dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill('Version 3');

    saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await saveButton.click();

    // Assert - Final version should be visible
    await expect(page.getByText('Version 3')).toBeVisible();
    await expect(page.getByText('Version 1')).not.toBeVisible();
    await expect(page.getByText('Version 2')).not.toBeVisible();
  });

  test('should edit multiple different tasks independently', async ({
    page,
  }) => {
    // Arrange - Create multiple tasks
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill('Task A');
    await submitButton.click();
    await taskInput.fill('Task B');
    await submitButton.click();
    await taskInput.fill('Task C');
    await submitButton.click();

    // Act - Edit Task B only
    const editButton = page.getByRole('button', { name: /edit.*task b/i });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill('Task B Edited');

    const saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await saveButton.click();

    // Assert - Only Task B should be changed
    await expect(page.getByText('Task A')).toBeVisible();
    await expect(page.getByText('Task B Edited')).toBeVisible();
    await expect(page.getByText('Task C')).toBeVisible();
    await expect(page.getByText('Task B', { exact: true })).not.toBeVisible();
  });

  test('should preserve completion status when editing', async ({ page }) => {
    // Arrange - Create and complete a task
    const taskTitle = 'Completed Task';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });
    await checkbox.check();

    // Act - Edit the task
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill('Renamed Completed Task');

    const saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await saveButton.click();

    // Assert - Should still be completed
    const newCheckbox = page.getByRole('checkbox', {
      name: /mark.*renamed completed task.*complete/i,
    });
    await expect(newCheckbox).toBeChecked();
  });

  test('should close dialog when clicking cancel', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'To be canceled';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Open dialog and cancel
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill('This should not save');

    const cancelButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Assert - Dialog closed and text not changed
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(taskTitle)).toBeVisible();
    await expect(page.getByText('This should not save')).not.toBeVisible();
  });

  test('should validate input length in edit dialog', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Valid Title';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Try to save empty
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear(); // Empty

    const saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await expect(saveButton).toBeDisabled();

    // Act - Try to save too long
    // Note: The input has maxLength=500, so the browser will truncate the value.
    // The button will remain ENABLED because the value is valid (500 chars).
    // We should test that the input value is truncated.
    const longText = 'a'.repeat(501);
    await dialogInput.fill(longText);

    // Verify truncation
    const value = await dialogInput.inputValue();
    expect(value.length).toBe(500);
    expect(value).toBe('a'.repeat(500));

    // Verify button is enabled (since 500 is valid)
    await expect(saveButton).toBeEnabled();
  });

  test.skip('should return focus to edit button after cancel', async ({
    page,
  }) => {
    // Arrange - Create a task
    const taskTitle = 'Focus Test';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Open and cancel
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    const cancelButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Assert - Focus should return to edit button
    await expect(editButton).toBeFocused();
  });
});
