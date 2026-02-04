import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer, { setEditingId } from '../../src/store/slices/tasksSlice';
import EditTaskDialogContainer from '../../src/containers/EditTaskDialogContainer';
import type { RootState, TaskListState } from '../../src/types/state';
import type { Task } from '../../src/types/task';

const createMockTask = (
  id: string,
  title: string,
  completed: boolean = false
): Task => ({
  id: id as Task['id'],
  title,
  completed,
  createdAt: Date.now() as Task['createdAt'],
  updatedAt: Date.now() as Task['updatedAt'],
});

const createTaskListState = (
  tasks: Task[],
  editingId: Task['id'] | null = null
): TaskListState => {
  const editingTask = editingId ? tasks.find((t) => t.id === editingId) : null;
  return {
    items: tasks,
    filter: 'all',
    editingId,
    formInput: '',
    editingValue: editingTask ? editingTask.title : '',
  };
};

const createTestStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      taskList: tasksReducer,
    },
    preloadedState: preloadedState as RootState,
  });
};

const renderWithProvider = (
  component: React.ReactElement,
  preloadedState?: Partial<RootState>
) => {
  const store = createTestStore(preloadedState);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('EditTaskDialogContainer Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not render dialog when no task is being edited', () => {
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', 'Test Task')]),
    };

    renderWithProvider(<EditTaskDialogContainer />, initialState);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render dialog when a task is being edited', () => {
    const initialState: Partial<RootState> = {
      taskList: createTaskListState(
        [createMockTask('1', 'Edit me')],
        '1' as Task['id']
      ),
    };

    renderWithProvider(<EditTaskDialogContainer />, initialState);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should display task title in edit input', () => {
    const taskTitle = 'Task to edit';
    const initialState: Partial<RootState> = {
      taskList: createTaskListState(
        [createMockTask('1', taskTitle)],
        '1' as Task['id']
      ),
    };

    renderWithProvider(<EditTaskDialogContainer />, initialState);

    const input = screen.getByRole('textbox', { name: /edit task/i });
    expect(input).toHaveValue(taskTitle);
  });

  it('should update task title when saving', () => {
    const originalTitle = 'Original title';
    const newTitle = 'Updated title';
    const initialState: Partial<RootState> = {
      taskList: createTaskListState(
        [createMockTask('1', originalTitle)],
        '1' as Task['id']
      ),
    };

    const { store } = renderWithProvider(
      <EditTaskDialogContainer />,
      initialState
    );

    const input = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(input, { target: { value: newTitle } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    const state = store.getState();
    expect(state.taskList.items[0].title).toBe(newTitle);
  });

  it('should close dialog after saving', () => {
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', 'Test task')], '1' as Task['id']),
    };

    const { store } = renderWithProvider(
      <EditTaskDialogContainer />,
      initialState
    );

    const input = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(input, { target: { value: 'Updated task' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    const state = store.getState();
    expect(state.taskList.editingId).toBeNull();
  });

  it('should close dialog when canceling', () => {
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', 'Test task')], '1' as Task['id']),
    };

    const { store } = renderWithProvider(
      <EditTaskDialogContainer />,
      initialState
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    const state = store.getState();
    expect(state.taskList.editingId).toBeNull();
  });

  it('should not save changes when canceling', () => {
    const originalTitle = 'Original';
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', originalTitle)], '1' as Task['id']),
    };

    const { store } = renderWithProvider(
      <EditTaskDialogContainer />,
      initialState
    );

    const input = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(input, { target: { value: 'Changed' } });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    const state = store.getState();
    expect(state.taskList.items[0].title).toBe(originalTitle);
  });

  it('should not save task with empty title', () => {
    const originalTitle = 'Do not empty';
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', originalTitle)], '1' as Task['id']),
    };

    const { store } = renderWithProvider(
      <EditTaskDialogContainer />,
      initialState
    );

    const input = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(input, { target: { value: '' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    const state = store.getState();
    expect(state.taskList.items[0].title).toBe(originalTitle);
  });

  it('should not save task with whitespace-only title', () => {
    const originalTitle = 'Keep original';
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', originalTitle)], '1' as Task['id']),
    };

    const { store } = renderWithProvider(
      <EditTaskDialogContainer />,
      initialState
    );

    const input = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(input, { target: { value: '   ' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    const state = store.getState();
    expect(state.taskList.items[0].title).toBe(originalTitle);
  });

  it('should trim whitespace from edited title', () => {
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', 'Original')], '1' as Task['id']),
    };

    const { store } = renderWithProvider(
      <EditTaskDialogContainer />,
      initialState
    );

    const input = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(input, { target: { value: '  Trimmed  ' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    const state = store.getState();
    expect(state.taskList.items[0].title).toBe('Trimmed');
  });

  it('should disable save button when input is empty', () => {
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', 'Test task')], '1' as Task['id']),
    };

    renderWithProvider(<EditTaskDialogContainer />, initialState);

    const input = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(input, { target: { value: '' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it('should disable save button when input is whitespace only', () => {
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', 'Test task')], '1' as Task['id']),
    };

    renderWithProvider(<EditTaskDialogContainer />, initialState);

    const input = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(input, { target: { value: '   ' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it('should handle Enter key to save', () => {
    const originalTitle = 'Original';
    const newTitle = 'Updated with Enter';
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', originalTitle)], '1' as Task['id']),
    };

    const { store } = renderWithProvider(
      <EditTaskDialogContainer />,
      initialState
    );

    const input = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(input, { target: { value: newTitle } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    const state = store.getState();
    expect(state.taskList.items[0].title).toBe(newTitle);
  });

  it('should handle Escape key to cancel', () => {
    const originalTitle = 'Original';
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', originalTitle)], '1' as Task['id']),
    };

    const { store } = renderWithProvider(
      <EditTaskDialogContainer />,
      initialState
    );

    const input = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(input, { target: { value: 'This will be canceled' } });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

    const state = store.getState();
    expect(state.taskList.items[0].title).toBe(originalTitle);
    expect(state.taskList.editingId).toBeNull();
  });

  it('should preserve task completion status when editing', () => {
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', 'Completed task', true)], '1' as Task['id']),
    };

    const { store } = renderWithProvider(
      <EditTaskDialogContainer />,
      initialState
    );

    const input = screen.getByRole('textbox', { name: /edit task/i });
    fireEvent.change(input, { target: { value: 'Edited completed task' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    const state = store.getState();
    expect(state.taskList.items[0].completed).toBe(true);
  });

  it('should focus input when dialog opens', () => {
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', 'Focus test')], '1' as Task['id']),
    };

    renderWithProvider(<EditTaskDialogContainer />, initialState);

    const input = screen.getByRole('textbox', { name: /edit task/i });
    expect(input).toHaveFocus();
  });

  it('should have proper ARIA attributes', () => {
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', 'ARIA test')], '1' as Task['id']),
    };

    renderWithProvider(<EditTaskDialogContainer />, initialState);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should handle editing task that does not exist', () => {
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', 'Task 1')], 'non-existent' as Task['id']),
    };

    renderWithProvider(<EditTaskDialogContainer />, initialState);

    // Dialog should not crash, either not render or show gracefully
    // This is a defensive test for edge cases
    const dialog = screen.queryByRole('dialog');
    if (dialog) {
      // If dialog renders, it should not have an input value
      const input = screen.queryByRole('textbox', { name: /edit task/i });
      if (input) {
        expect(input).toHaveValue('');
      }
    }
  });

  it('should select all text in input on focus', () => {
    const taskTitle = 'Select me';
    const initialState: Partial<RootState> = {
      taskList: createTaskListState([createMockTask('1', taskTitle)], '1' as Task['id']),
    };

    renderWithProvider(<EditTaskDialogContainer />, initialState);

    const input = screen.getByRole('textbox', {
      name: /edit task/i,
    }) as HTMLInputElement;

    // Check that text is selected (selectionStart should be 0, selectionEnd should be length)
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(taskTitle.length);
  });
});
