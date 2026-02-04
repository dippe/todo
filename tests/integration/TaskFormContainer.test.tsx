import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../../src/store/slices/tasksSlice';
import TaskFormContainer from '../../src/containers/TaskFormContainer';
import type { RootState } from '../../src/types/state';

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

describe('TaskFormContainer Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the task form with input and submit button', () => {
    renderWithProvider(<TaskFormContainer />);

    expect(
      screen.getByRole('textbox', { name: /add task/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add task/i })
    ).toBeInTheDocument();
  });

  it('should add a task to the store when form is submitted', () => {
    const { store } = renderWithProvider(<TaskFormContainer />);

    const input = screen.getByRole('textbox', { name: /add task/i });
    const submitButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(input, { target: { value: 'Test task' } });
    fireEvent.click(submitButton);

    const state = store.getState();
    expect(state.taskList.items).toHaveLength(1);
    expect(state.taskList.items[0].title).toBe('Test task');
  });

  it('should clear input after submitting a task', () => {
    renderWithProvider(<TaskFormContainer />);

    const input = screen.getByRole('textbox', { name: /add task/i });
    const submitButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(input, { target: { value: 'Test task' } });
    fireEvent.click(submitButton);

    expect(input).toHaveValue('');
  });

  it('should not add task with empty input', () => {
    const { store } = renderWithProvider(<TaskFormContainer />);

    const submitButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.click(submitButton);

    const state = store.getState();
    expect(state.taskList.items).toHaveLength(0);
  });

  it('should not add task with whitespace-only input', () => {
    const { store } = renderWithProvider(<TaskFormContainer />);

    const input = screen.getByRole('textbox', { name: /add task/i });
    const submitButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(submitButton);

    const state = store.getState();
    expect(state.taskList.items).toHaveLength(0);
  });

  it('should trim whitespace from task title', () => {
    const { store } = renderWithProvider(<TaskFormContainer />);

    const input = screen.getByRole('textbox', { name: /add task/i });
    const submitButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(input, { target: { value: '  Test task  ' } });
    fireEvent.click(submitButton);

    const state = store.getState();
    expect(state.taskList.items[0].title).toBe('Test task');
  });

  it('should focus input after submitting', () => {
    renderWithProvider(<TaskFormContainer />);

    const input = screen.getByRole('textbox', { name: /add task/i });
    const submitButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(input, { target: { value: 'Test task' } });
    fireEvent.click(submitButton);

    expect(input).toHaveFocus();
  });

  it('should handle Enter key submission', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProvider(<TaskFormContainer />);

    const input = screen.getByRole('textbox', { name: /add task/i });

    await act(async () => {
      await user.type(input, 'Test task{enter}');
    });

    const state = store.getState();
    expect(state.taskList.items).toHaveLength(1);
  });
});
