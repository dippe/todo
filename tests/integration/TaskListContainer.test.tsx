import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../../src/store/slices/tasksSlice';
import TaskListContainer from '../../src/containers/TaskListContainer';
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

describe('TaskListContainer Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render empty state when no tasks exist', () => {
    const initialState: Partial<RootState> = {
      taskList: {
        items: [],
        filter: 'all',
        editingId: null,
      } as TaskListState,
    };

    renderWithProvider(<TaskListContainer />, initialState);

    expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
  });

  it('should render a list of tasks', () => {
    const initialState: Partial<RootState> = {
      taskList: {
        items: [
          createMockTask('1', 'Task 1'),
          createMockTask('2', 'Task 2'),
          createMockTask('3', 'Task 3'),
        ],
        filter: 'all',
        editingId: null,
      } as TaskListState,
    };

    renderWithProvider(<TaskListContainer />, initialState);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('should render task checkboxes', () => {
    const initialState: Partial<RootState> = {
      taskList: {
        items: [createMockTask('1', 'Test Task')],
        filter: 'all',
        editingId: null,
      } as TaskListState,
    };

    renderWithProvider(<TaskListContainer />, initialState);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('should render delete buttons for tasks', () => {
    const initialState: Partial<RootState> = {
      taskList: {
        items: [createMockTask('1', 'Task 1'), createMockTask('2', 'Task 2')],
        filter: 'all',
        editingId: null,
      } as TaskListState,
    };

    renderWithProvider(<TaskListContainer />, initialState);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it('should toggle task completion status', () => {
    const initialState: Partial<RootState> = {
      taskList: {
        items: [createMockTask('1', 'Test Task', false)],
        filter: 'all',
        editingId: null,
      } as TaskListState,
    };

    const { store } = renderWithProvider(<TaskListContainer />, initialState);

    const checkbox = screen.getByRole('checkbox', {
      name: /mark.*test task.*complete/i,
    });
    fireEvent.click(checkbox);

    const state = store.getState();
    expect(state.taskList.items[0].completed).toBe(true);
  });

  it('should delete a task', () => {
    const initialState: Partial<RootState> = {
      taskList: {
        items: [createMockTask('1', 'Test Task')],
        filter: 'all',
        editingId: null,
      } as TaskListState,
    };

    const { store } = renderWithProvider(<TaskListContainer />, initialState);

    const deleteButton = screen.getByRole('button', {
      name: /delete.*test task/i,
    });
    fireEvent.click(deleteButton);

    const state = store.getState();
    expect(state.taskList.items).toHaveLength(0);
  });

  it('should render completed tasks with visual distinction', () => {
    const initialState: Partial<RootState> = {
      taskList: {
        items: [
          createMockTask('1', 'Active Task', false),
          createMockTask('2', 'Completed Task', true),
        ],
        filter: 'all',
        editingId: null,
      } as TaskListState,
    };

    renderWithProvider(<TaskListContainer />, initialState);

    const completedTask = screen.getByText('Completed Task');
    expect(completedTask).toHaveClass('line-through');
  });

  it('should render tasks in correct order', () => {
    const initialState: Partial<RootState> = {
      taskList: {
        items: [
          createMockTask('1', 'First'),
          createMockTask('2', 'Second'),
          createMockTask('3', 'Third'),
        ],
        filter: 'all',
        editingId: null,
      } as TaskListState,
    };

    renderWithProvider(<TaskListContainer />, initialState);

    const taskElements = screen.getAllByRole('listitem');
    expect(taskElements[0]).toHaveTextContent('First');
    expect(taskElements[1]).toHaveTextContent('Second');
    expect(taskElements[2]).toHaveTextContent('Third');
  });
});
