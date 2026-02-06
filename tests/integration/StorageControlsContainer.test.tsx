import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../../src/store/slices/tasksSlice';
import uiReducer from '../../src/store/slices/uiSlice';
import StorageControlsContainer from '../../src/containers/StorageControlsContainer';
import * as storageService from '../../src/services/storageService';
import {
  RootState,
  createInitialTaskListState,
  createInitialUIState,
} from '../../src/types/state';

// Mock storageService
jest.mock('../../src/services/storageService');
const mockedStorageService = storageService as jest.Mocked<
  typeof storageService
>;

// Mock URL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

const createTestStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      taskList: tasksReducer,
      ui: uiReducer,
    } as any,
    preloadedState: preloadedState as any,
  });
};

describe('StorageControlsContainer Integration', () => {
  let mockReader: any;
  let fullInitialState: RootState;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock FileReader
    mockReader = {
      readAsText: jest.fn(),
      onload: null,
      onerror: null,
      result: null,
    };

    // @ts-ignore
    global.FileReader = jest.fn(() => mockReader);

    // Setup fresh initial state
    fullInitialState = {
      taskList: {
        ...createInitialTaskListState(),
        items: [
          {
            id: '1' as any,
            title: 'Task 1',
            completed: false,
            createdAt: 100 as any,
            updatedAt: 100 as any,
          },
        ],
      },
      ui: createInitialUIState(),
    };
  });

  it('should handle export successfully', async () => {
    mockedStorageService.exportTasks.mockReturnValue({
      ok: true,
      data: JSON.stringify(fullInitialState.taskList.items),
    });

    const store = createTestStore(fullInitialState);
    render(
      <Provider store={store}>
        <StorageControlsContainer />
      </Provider>
    );

    const exportBtn = screen.getByText('Export Tasks');
    fireEvent.click(exportBtn);

    expect(mockedStorageService.exportTasks).toHaveBeenCalledWith(
      fullInitialState.taskList.items
    );
    expect(global.URL.createObjectURL).toHaveBeenCalled();

    // Check notification
    await waitFor(() => {
      const state = store.getState();
      expect(state.ui.notification).toEqual(
        expect.objectContaining({
          message: 'Tasks exported successfully',
          type: 'success',
        })
      );
    });
  });

  it('should handle export failure from service', () => {
    mockedStorageService.exportTasks.mockReturnValue({
      ok: false,
      error: 'Export failed',
    });

    const store = createTestStore(fullInitialState);
    render(
      <Provider store={store}>
        <StorageControlsContainer />
      </Provider>
    );

    fireEvent.click(screen.getByText('Export Tasks'));

    expect(store.getState().ui.notification).toEqual(
      expect.objectContaining({
        message: 'Export failed',
        type: 'error',
      })
    );
  });

  it('should handle import successfully', async () => {
    const importedTasks = [
      {
        id: '2' as any,
        title: 'Imported Task',
        completed: true,
        createdAt: 200 as any,
        updatedAt: 200 as any,
      },
    ];
    mockedStorageService.importTasks.mockReturnValue({
      ok: true,
      data: importedTasks as any,
    });

    const store = createTestStore(fullInitialState);
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <StorageControlsContainer />
      </Provider>
    );

    const file = new File(['mock content'], 'backup.json', {
      type: 'application/json',
    });
    const input = screen.getByLabelText('Import Tasks');

    await user.upload(input, file);

    // Trigger FileReader onload manually since we mocked it
    expect(mockReader.readAsText).toHaveBeenCalledWith(file);

    // Simulate onload
    mockReader.onload({ target: { result: 'mock content' } });

    expect(mockedStorageService.importTasks).toHaveBeenCalledWith(
      'mock content'
    );

    // Check if tasks were loaded into store
    expect(store.getState().taskList.items).toEqual(importedTasks);

    // Check notification
    expect(store.getState().ui.notification).toEqual(
      expect.objectContaining({
        message: 'Tasks imported successfully',
        type: 'success',
      })
    );
  });

  it('should handle import failure from service', async () => {
    mockedStorageService.importTasks.mockReturnValue({
      ok: false,
      error: 'Invalid format',
    });

    const store = createTestStore(fullInitialState);
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <StorageControlsContainer />
      </Provider>
    );

    const file = new File(['bad content'], 'backup.json', {
      type: 'application/json',
    });
    const input = screen.getByLabelText('Import Tasks');

    await user.upload(input, file);

    // Simulate onload
    mockReader.onload({ target: { result: 'bad content' } });

    expect(store.getState().ui.notification).toEqual(
      expect.objectContaining({
        message: 'Invalid format',
        type: 'error',
      })
    );
  });

  it('should handle file reading error', async () => {
    const store = createTestStore(fullInitialState);
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <StorageControlsContainer />
      </Provider>
    );

    const file = new File(['content'], 'backup.json', {
      type: 'application/json',
    });
    const input = screen.getByLabelText('Import Tasks');

    await user.upload(input, file);

    // Simulate onerror
    mockReader.onerror();

    expect(store.getState().ui.notification).toEqual(
      expect.objectContaining({
        message: 'Failed to read file',
        type: 'error',
      })
    );
  });
});
