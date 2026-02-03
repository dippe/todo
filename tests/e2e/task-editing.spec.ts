import { test, expect } from '@playwright/test';

test.describe('Task Editing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
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
    await expect(page.getByText('Task B')).not.toBeVisible();
  });

  test('should preserve completion status when editing', async ({ page }) => {
    // Arrange - Create and complete a task
    const originalTitle = 'Completed task';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(originalTitle);
    await submitButton.click();

    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${originalTitle}.*complete`, 'i'),
    });
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Act - Edit the task
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${originalTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill('Edited completed task');

    const saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await saveButton.click();

    // Assert - Task should still be completed
    const updatedCheckbox = page.getByRole('checkbox', {
      name: /mark.*edited completed task.*complete/i,
    });
    await expect(updatedCheckbox).toBeChecked();
  });

  test('should trim whitespace from edited task title', async ({ page }) => {
    // Arrange - Create a task
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill('Original');
    await submitButton.click();

    // Act - Edit with extra whitespace
    const editButton = page.getByRole('button', { name: /edit.*original/i });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill('  Trimmed  ');

    const saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await saveButton.click();

    // Assert - Should show "Trimmed" not "  Trimmed  "
    await expect(page.getByText('Trimmed')).toBeVisible();
    await expect(page.getByText('  Trimmed  ')).not.toBeVisible();
  });
});

test.describe('Edit Task Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should not save task with empty title', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Do not empty me';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Try to edit with empty text
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();

    const saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await saveButton.click();

    // Assert - Original text should remain, dialog should stay open or show error
    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  test('should not save task with whitespace-only title', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Keep original';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Try to edit with whitespace only
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill('   ');

    const saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await saveButton.click();

    // Assert - Original text should remain
    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  test('should prevent saving empty title with Enter key', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Prevent empty';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Try to submit empty text with Enter key
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.press('Enter');

    // Assert - Original text should remain
    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  test('should disable save button when input is empty', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Test validation';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Clear input in edit dialog
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();

    // Assert - Save button should be disabled
    const saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });
    await expect(saveButton).toBeDisabled();
  });

  test('should show validation message for empty input', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Show error message';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Clear input
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();

    // Assert - Validation message should appear
    const validationMessage = page.getByText(/task.*cannot be empty|required/i);
    await expect(validationMessage).toBeVisible();
  });

  test('should validate maximum length constraint', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Length test';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Try to edit with too long text (>500 chars per spec)
    const longText = 'a'.repeat(501);
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill(longText);

    const saveButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /save/i });

    // Assert - Should prevent saving or show error
    await expect(saveButton).toBeDisabled();
  });
});

test.describe('Edit Task Cancellation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should cancel edit and preserve original text', async ({ page }) => {
    // Arrange - Create a task
    const originalTitle = 'Original text';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(originalTitle);
    await submitButton.click();

    // Act - Edit but cancel
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${originalTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill('Changed text');

    const cancelButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Assert - Original text should remain
    await expect(page.getByText(originalTitle)).toBeVisible();
    await expect(page.getByText('Changed text')).not.toBeVisible();
  });

  test('should close dialog when canceling', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Test cancel';
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

    // Assert - Dialog should be closed
    const dialog = page.getByRole('dialog');
    await expect(dialog).not.toBeVisible();
  });

  test('should cancel edit with Escape key', async ({ page }) => {
    // Arrange - Create a task
    const originalTitle = 'Escape test';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(originalTitle);
    await submitButton.click();

    // Act - Edit and press Escape
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${originalTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill('This should be canceled');
    await page.keyboard.press('Escape');

    // Assert - Original text should remain, dialog closed
    await expect(page.getByText(originalTitle)).toBeVisible();
    await expect(page.getByText('This should be canceled')).not.toBeVisible();

    const dialog = page.getByRole('dialog');
    await expect(dialog).not.toBeVisible();
  });

  test('should handle cancel without making changes', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'No changes cancel';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Open and cancel without editing
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    const cancelButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Assert - Task should remain unchanged
    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  test('should not persist changes after canceling', async ({ page }) => {
    // Arrange - Create a task
    const originalTitle = 'Persist test';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(originalTitle);
    await submitButton.click();

    // Act - Edit and cancel
    const editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${originalTitle}`, 'i'),
    });
    await editButton.click();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await dialogInput.clear();
    await dialogInput.fill('Canceled changes');

    const cancelButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Reload page
    await page.reload();

    // Assert - Original text should persist
    await expect(page.getByText(originalTitle)).toBeVisible();
    await expect(page.getByText('Canceled changes')).not.toBeVisible();
  });

  test('should allow reopening edit dialog after cancel', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Reopen test';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Edit, cancel, then edit again
    let editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    let cancelButton = page
      .getByRole('dialog')
      .getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Reopen
    editButton = page.getByRole('button', {
      name: new RegExp(`edit.*${taskTitle}`, 'i'),
    });
    await editButton.click();

    // Assert - Dialog should open with original text
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const dialogInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /edit task/i });
    await expect(dialogInput).toHaveValue(taskTitle);
  });

  test('should return focus to edit button after cancel', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Focus test';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Act - Edit and cancel
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
