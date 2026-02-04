import { test, expect } from '@playwright/test';

test.describe('Task Completion Toggle', () => {
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

  test('should toggle uncompleted task to completed', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Buy groceries';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Verify task is uncompleted initially
    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });
    await expect(checkbox).not.toBeChecked();

    // Act - Toggle to completed
    await checkbox.click();

    // Assert - Task should be marked as completed
    await expect(checkbox).toBeChecked();
  });

  test('should toggle completed task back to uncompleted', async ({ page }) => {
    // Arrange - Create a task and mark it completed
    const taskTitle = 'Read book';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Act - Toggle back to uncompleted
    await checkbox.click();

    // Assert - Task should be uncompleted
    await expect(checkbox).not.toBeChecked();
  });

  test('should handle multiple toggle operations', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Exercise';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });

    // Act & Assert - Multiple toggles
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    await checkbox.click();
    await expect(checkbox).not.toBeChecked();

    await checkbox.click();
    await expect(checkbox).toBeChecked();

    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test('should persist completion status after page reload', async ({
    page,
  }) => {
    // Arrange - Create a task and mark it completed
    const taskTitle = 'Persistent completion test';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Act - Reload page
    await page.reload();

    // Assert - Task should still be completed
    const reloadedCheckbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });
    await expect(reloadedCheckbox).toBeChecked();
  });

  test('should toggle multiple tasks independently', async ({ page }) => {
    // Arrange - Create multiple tasks
    const tasks = ['Task A', 'Task B', 'Task C'];
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    for (const task of tasks) {
      await taskInput.fill(task);
      await submitButton.click();
    }

    const checkboxA = page.getByRole('checkbox', {
      name: /mark.*task a.*complete/i,
    });
    const checkboxB = page.getByRole('checkbox', {
      name: /mark.*task b.*complete/i,
    });
    const checkboxC = page.getByRole('checkbox', {
      name: /mark.*task c.*complete/i,
    });

    // Act - Toggle only Task A and Task C
    await checkboxA.click();
    await checkboxC.click();

    // Assert - A and C should be checked, B should not
    await expect(checkboxA).toBeChecked();
    await expect(checkboxB).not.toBeChecked();
    await expect(checkboxC).toBeChecked();
  });

  test('should persist multiple task completion states after reload', async ({
    page,
  }) => {
    // Arrange - Create multiple tasks with mixed completion states
    const tasks = ['Complete me', 'Leave me', 'Complete me too'];
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    for (const task of tasks) {
      await taskInput.fill(task);
      await submitButton.click();
    }

    // Toggle first and third tasks
    const checkbox1 = page.getByRole('checkbox', {
      name: /mark.*complete me.*complete/i,
    });
    const checkbox3 = page.getByRole('checkbox', {
      name: /mark.*complete me too.*complete/i,
    });

    await checkbox1.click();
    await checkbox3.click();

    // Act - Reload
    await page.reload();

    // Assert - Completion states should persist
    const reloadedCheckbox1 = page.getByRole('checkbox', {
      name: /mark.*complete me.*complete/i,
    });
    const reloadedCheckbox2 = page.getByRole('checkbox', {
      name: /mark.*leave me.*complete/i,
    });
    const reloadedCheckbox3 = page.getByRole('checkbox', {
      name: /mark.*complete me too.*complete/i,
    });

    await expect(reloadedCheckbox1).toBeChecked();
    await expect(reloadedCheckbox2).not.toBeChecked();
    await expect(reloadedCheckbox3).toBeChecked();
  });
});

test.describe('Completed Task Visual Styling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display line-through styling on completed task', async ({
    page,
  }) => {
    // Arrange - Create a task
    const taskTitle = 'Style test task';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    const taskText = page.getByText(taskTitle);
    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });

    // Verify no line-through initially
    await expect(taskText).not.toHaveClass(/line-through/);

    // Act - Mark as completed
    await checkbox.click();

    // Assert - Should have line-through styling
    await expect(taskText).toHaveClass(/line-through/);
  });

  test('should remove line-through styling when uncompleted', async ({
    page,
  }) => {
    // Arrange - Create and complete a task
    const taskTitle = 'Toggle style test';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    const taskText = page.getByText(taskTitle);
    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });

    await checkbox.click();
    await expect(taskText).toHaveClass(/line-through/);

    // Act - Uncheck the task
    await checkbox.click();

    // Assert - Line-through should be removed
    await expect(taskText).not.toHaveClass(/line-through/);
  });

  test('should display muted/gray color on completed task', async ({
    page,
  }) => {
    // Arrange - Create a task
    const taskTitle = 'Color test task';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    const taskText = page.getByText(taskTitle);
    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });

    // Act - Mark as completed
    await checkbox.click();

    // Assert - Should have muted text color class
    await expect(taskText).toHaveClass(/text-muted-foreground|text-gray/);
  });

  test('should visually distinguish completed from uncompleted tasks', async ({
    page,
  }) => {
    // Arrange - Create two tasks
    const completedTask = 'Completed task';
    const uncompletedTask = 'Uncompleted task';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(completedTask);
    await submitButton.click();
    await taskInput.fill(uncompletedTask);
    await submitButton.click();

    // Act - Complete first task only
    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${completedTask}.*complete`, 'i'),
    });
    await checkbox.click();

    // Assert - Completed task should have different styling
    const completedText = page.getByText(completedTask);
    const uncompletedText = page.getByText(uncompletedTask);

    await expect(completedText).toHaveClass(/line-through/);
    await expect(uncompletedText).not.toHaveClass(/line-through/);
  });

  test('should persist visual styling after page reload', async ({ page }) => {
    // Arrange - Create and complete a task
    const taskTitle = 'Persistent style test';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });
    await checkbox.click();

    // Act - Reload page
    await page.reload();

    // Assert - Visual styling should persist
    const reloadedText = page.getByText(taskTitle);
    await expect(reloadedText).toHaveClass(/line-through/);
  });

  test('should maintain checkbox checked state for completed tasks', async ({
    page,
  }) => {
    // Arrange - Create a task
    const taskTitle = 'Checkbox state test';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });

    // Act - Complete the task
    await checkbox.click();

    // Assert - Checkbox should be checked and have proper ARIA state
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });
});

test.describe('Task Deletion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should delete a single task', async ({ page }) => {
    // Arrange - Create a task
    const taskTitle = 'Delete me';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Verify task exists
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Act - Delete the task
    const deleteButton = page.getByRole('button', {
      name: new RegExp(`delete.*${taskTitle}`, 'i'),
    });
    await deleteButton.click();

    // Assert - Task should be removed from DOM
    await expect(page.getByText(taskTitle)).not.toBeVisible();
  });

  test('should delete multiple tasks independently', async ({ page }) => {
    // Arrange - Create multiple tasks
    const tasks = ['Task 1', 'Task 2', 'Task 3'];
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    for (const task of tasks) {
      await taskInput.fill(task);
      await submitButton.click();
    }

    // Verify all tasks exist
    for (const task of tasks) {
      await expect(page.getByText(task)).toBeVisible();
    }

    // Act - Delete Task 2
    const deleteButton = page.getByRole('button', {
      name: /delete.*task 2/i,
    });
    await deleteButton.click();

    // Assert - Task 2 should be removed, others should remain
    await expect(page.getByText('Task 1')).toBeVisible();
    await expect(page.getByText('Task 2')).not.toBeVisible();
    await expect(page.getByText('Task 3')).toBeVisible();
  });

  test('should delete all tasks when deleting one by one', async ({ page }) => {
    // Arrange - Create multiple tasks
    const tasks = ['First', 'Second', 'Third'];
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    for (const task of tasks) {
      await taskInput.fill(task);
      await submitButton.click();
    }

    // Act - Delete all tasks
    for (const task of tasks) {
      const deleteButton = page.getByRole('button', {
        name: new RegExp(`delete.*${task}`, 'i'),
      });
      await deleteButton.click();
    }

    // Assert - Empty state should be shown
    await expect(page.getByText(/no tasks/i)).toBeVisible();
  });

  test('should persist deletion after page reload', async ({ page }) => {
    // Arrange - Create two tasks
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill('Keep this');
    await submitButton.click();
    await taskInput.fill('Delete this');
    await submitButton.click();

    // Delete second task
    const deleteButton = page.getByRole('button', {
      name: /delete.*delete this/i,
    });
    await deleteButton.click();

    // Act - Reload page
    await page.reload();

    // Assert - Deleted task should stay deleted
    await expect(page.getByText('Keep this')).toBeVisible();
    await expect(page.getByText('Delete this')).not.toBeVisible();
  });

  test('should show empty state after deleting all tasks', async ({ page }) => {
    // Arrange - Create a single task
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill('Only task');
    await submitButton.click();

    // Act - Delete the task
    const deleteButton = page.getByRole('button', {
      name: /delete.*only task/i,
    });
    await deleteButton.click();

    // Assert - Empty state message should appear
    const emptyMessage = page.getByText(/no tasks/i);
    await expect(emptyMessage).toBeVisible();
  });

  test('should delete completed tasks', async ({ page }) => {
    // Arrange - Create and complete a task
    const taskTitle = 'Completed then deleted';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Complete the task
    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Act - Delete the completed task
    const deleteButton = page.getByRole('button', {
      name: new RegExp(`delete.*${taskTitle}`, 'i'),
    });
    await deleteButton.click();

    // Assert - Task should be removed
    await expect(page.getByText(taskTitle)).not.toBeVisible();
  });

  test('should delete uncompleted tasks', async ({ page }) => {
    // Arrange - Create an uncompleted task
    const taskTitle = 'Uncompleted deletion';
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    await taskInput.fill(taskTitle);
    await submitButton.click();

    // Verify task is not completed
    const checkbox = page.getByRole('checkbox', {
      name: new RegExp(`mark.*${taskTitle}.*complete`, 'i'),
    });
    await expect(checkbox).not.toBeChecked();

    // Act - Delete the uncompleted task
    const deleteButton = page.getByRole('button', {
      name: new RegExp(`delete.*${taskTitle}`, 'i'),
    });
    await deleteButton.click();

    // Assert - Task should be removed
    await expect(page.getByText(taskTitle)).not.toBeVisible();
  });

  test('should handle rapid deletion operations', async ({ page }) => {
    // Arrange - Create multiple tasks
    const tasks = ['Rapid 1', 'Rapid 2', 'Rapid 3', 'Rapid 4'];
    const taskInput = page.getByRole('textbox', { name: /add task/i });
    const submitButton = page.getByRole('button', { name: /add task/i });

    for (const task of tasks) {
      await taskInput.fill(task);
      await submitButton.click();
    }

    // Act - Delete tasks rapidly
    const deleteButton1 = page.getByRole('button', {
      name: /delete.*rapid 1/i,
    });
    const deleteButton3 = page.getByRole('button', {
      name: /delete.*rapid 3/i,
    });

    await deleteButton1.click();
    await deleteButton3.click();

    // Assert - Correct tasks should be deleted
    await expect(page.getByText('Rapid 1')).not.toBeVisible();
    await expect(page.getByText('Rapid 2')).toBeVisible();
    await expect(page.getByText('Rapid 3')).not.toBeVisible();
    await expect(page.getByText('Rapid 4')).toBeVisible();
  });
});
