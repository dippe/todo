import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../../src/store/slices/tasksSlice';
import FilterBarContainer from '../../src/containers/FilterBarContainer';
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

describe('FilterBarContainer Integration', () => {
  const mockTasks: Task[] = [
    {
      id: '1' as TaskId,
      title: 'Task 1',
      completed: false,
      createdAt: Date.now() as Timestamp,
      updatedAt: Date.now() as Timestamp,
    },
    {
      id: '2' as TaskId,
      title: 'Task 2',
      completed: true,
      createdAt: Date.now() as Timestamp,
      updatedAt: Date.now() as Timestamp,
    },
    {
      id: '3' as TaskId,
      title: 'Task 3',
      completed: false,
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

  it('should render three filter buttons: All, Active, Completed', () => {
    renderWithProvider(<FilterBarContainer />, initialState);

    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /completed/i })
    ).toBeInTheDocument();
  });

  it('should display metrics counts in the buttons', () => {
    // Total: 3, Active: 2, Completed: 1
    renderWithProvider(<FilterBarContainer />, initialState);

    expect(
      screen.getByRole('button', { name: /all \(3\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /active \(2\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /completed \(1\)/i })
    ).toBeInTheDocument();
  });

  it('should highlight the current active filter', () => {
    const stateWithFilter: Partial<RootState> = {
      taskList: {
        ...initialState.taskList!,
        filter: 'active',
      },
    };
    renderWithProvider(<FilterBarContainer />, stateWithFilter);

    const activeBtn = screen.getByRole('button', { name: /active/i });
    const allBtn = screen.getByRole('button', { name: /all/i });
    const completedBtn = screen.getByRole('button', { name: /completed/i });

    // Assuming aria-pressed is used for selection state
    expect(activeBtn).toHaveAttribute('aria-pressed', 'true');
    expect(allBtn).toHaveAttribute('aria-pressed', 'false');
    expect(completedBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('should dispatch setFilter action when a filter button is clicked', () => {
    const { store } = renderWithProvider(<FilterBarContainer />, initialState);

    const completedBtn = screen.getByRole('button', { name: /completed/i });
    fireEvent.click(completedBtn);

    const state = store.getState();
    expect(state.taskList.filter).toBe('completed');
  });

  it('should reflect the current filter from the store', () => {
    const stateWithCompletedFilter: Partial<RootState> = {
      taskList: {
        ...initialState.taskList!,
        filter: 'completed',
      },
    };
    renderWithProvider(<FilterBarContainer />, stateWithCompletedFilter);

    const completedBtn = screen.getByRole('button', { name: /completed/i });
    expect(completedBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
