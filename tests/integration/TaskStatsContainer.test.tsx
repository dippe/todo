import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../../src/store/slices/tasksSlice';
import TaskStatsContainer from '../../src/containers/TaskStatsContainer';
import type { RootState } from '../../src/types/state';
import type { Task, TaskId, Timestamp } from '../../src/types/task';

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

describe('TaskStatsContainer Integration', () => {
  const mockTasks: Task[] = [
    {
      id: '1' as TaskId,
      title: 'Active Task 1',
      completed: false,
      createdAt: Date.now() as Timestamp,
      updatedAt: Date.now() as Timestamp,
    },
    {
      id: '2' as TaskId,
      title: 'Active Task 2',
      completed: false,
      createdAt: Date.now() as Timestamp,
      updatedAt: Date.now() as Timestamp,
    },
    {
      id: '3' as TaskId,
      title: 'Completed Task',
      completed: true,
      createdAt: Date.now() as Timestamp,
      updatedAt: Date.now() as Timestamp,
    },
  ];

  const initialState: Partial<RootState> = {
    taskList: {
      items: mockTasks,
      filter: 'all',
      editingId: null,
      formInput: '',
      editingValue: '',
    },
  };

  it('should display the count of active tasks', () => {
    // 2 active tasks in mockTasks
    renderWithProvider(<TaskStatsContainer />, initialState);

    // "2 items left" should be present
    expect(screen.getByText(/2 items left/i)).toBeInTheDocument();
  });

  it('should NOT render "Clear completed" button when there are no completed tasks', () => {
    const onlyActiveTasks = mockTasks.filter((t) => !t.completed);
    const stateNoCompleted: Partial<RootState> = {
      taskList: {
        ...initialState.taskList!,
        items: onlyActiveTasks,
      },
    };

    renderWithProvider(<TaskStatsContainer />, stateNoCompleted);

    const clearButton = screen.queryByRole('button', {
      name: /clear completed/i,
    });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should render "Clear completed" button when there ARE completed tasks', () => {
    // mockTasks has 1 completed task
    renderWithProvider(<TaskStatsContainer />, initialState);

    const clearButton = screen.getByRole('button', {
      name: /clear completed/i,
    });
    expect(clearButton).toBeInTheDocument();
  });

  it('should dispatch clearCompleted action when "Clear completed" is clicked', () => {
    const { store } = renderWithProvider(<TaskStatsContainer />, initialState);

    // Verify initial state has completed tasks
    expect(
      store.getState().taskList.items.some((t) => t.completed)
    ).toBeTruthy();

    const clearButton = screen.getByRole('button', {
      name: /clear completed/i,
    });
    fireEvent.click(clearButton);

    // Verify all completed tasks are removed from store
    const updatedItems = store.getState().taskList.items;
    expect(updatedItems.some((t) => t.completed)).toBeFalsy();
    // Should have 2 items left (the active ones)
    expect(updatedItems).toHaveLength(2);
  });
});
