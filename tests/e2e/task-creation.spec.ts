import { test, expect } from '@playwright/test';

test.describe('Task Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to ensure clean state
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should create a new task and display it in the list', async ({
    page,
  }) => {
    // Arrange
    const taskTitle = 'Buy groceries';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    // Act
    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Assert
    const taskItem = page.getByText(taskTitle);
    await expect(taskItem).toBeVisible();
  });

  test('should create multiple tasks', async ({ page }) => {
    // Arrange
    const tasks = ['Task 1', 'Task 2', 'Task 3'];
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    // Act
    for (const task of tasks) {
      await taskInput.fill(task);
      await submitButton.click();
    }

    // Assert
    for (const task of tasks) {
      await expect(page.getByText(task)).toBeVisible();
    }
  });

  test('should clear input after task creation', async ({ page }) => {
    // Arrange
    const taskTitle = 'Clean room';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    // Act
    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Assert
    await expect(taskInput).toHaveValue('');
  });

  test('should focus input after task creation', async ({ page }) => {
    // Arrange
    const taskTitle = 'Do laundry';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    // Act
    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Assert
    await expect(taskInput).toBeFocused();
  });
});

test.describe('Empty Task Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should not create task with empty title', async ({ page }) => {
    // Arrange
    const submitButton = page.getByRole('button', { name: /add task/i });

    // Act
    await submitButton.click();

    // Assert - task list should be empty (no tasks created)
    const emptyMessage = page.getByText(/no tasks/i);
    await expect(emptyMessage).toBeVisible();
  });

  test('should not create task with whitespace-only title', async ({
    page,
  }) => {
    // Arrange
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    // Act
    await taskInput.fill('   ');
    await submitButton.click();

    // Assert
    const emptyMessage = page.getByText(/no tasks/i);
    await expect(emptyMessage).toBeVisible();
  });

  test('should trim whitespace from task title', async ({ page }) => {
    // Arrange
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    // Act
    await taskInput.fill('  Buy milk  ');
    await submitButton.click();

    // Assert - should show "Buy milk" not "  Buy milk  "
    await expect(page.getByText('Buy milk')).toBeVisible();
    await expect(page.getByText('  Buy milk  ')).not.toBeVisible();
  });
});

test.describe('Task Persistence', () => {
  test('should persist tasks after page reload', async ({ page }) => {
    // Arrange
    const taskTitle = 'Persistent task';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    // Act - Create task
    await taskInput.fill(taskTitle);
    await submitButton.click();
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Act - Reload page
    await page.reload();

    // Assert - Task should still be visible
    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  test('should persist multiple tasks after page reload', async ({ page }) => {
    // Arrange
    const tasks = ['Task A', 'Task B', 'Task C'];
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    // Act - Create tasks
    for (const task of tasks) {
      await taskInput.fill(task);
      await submitButton.click();
    }

    // Verify tasks exist
    for (const task of tasks) {
      await expect(page.getByText(task)).toBeVisible();
    }

    // Act - Reload page
    await page.reload();

    // Assert - All tasks should still be visible
    for (const task of tasks) {
      await expect(page.getByText(task)).toBeVisible();
    }
  });

  test('should persist tasks after closing and reopening browser', async ({
    context,
    page,
  }) => {
    // Arrange
    const taskTitle = 'Browser close test';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    // Act - Create task
    await taskInput.fill(taskTitle);
    await submitButton.click();
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Act - Close page and open new one
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Assert - Task should still be visible
    await expect(newPage.getByText(taskTitle)).toBeVisible();
  });
});
