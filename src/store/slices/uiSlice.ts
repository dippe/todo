import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { UIState, createInitialUIState } from '../../types/state';

const initialState: UIState = createInitialUIState();

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setNotification: {
      reducer: (
        state,
        action: PayloadAction<NonNullable<UIState['notification']>>
      ) => {
        state.notification = action.payload;
      },
      prepare: (payload: {
        message: string;
        type: 'success' | 'error' | 'info';
      }) => {
        return {
          payload: {
            ...payload,
            id: nanoid(),
          },
        };
      },
    },
    clearNotification: (state) => {
      state.notification = null;
    },
  },
});

export const { setNotification, clearNotification } = uiSlice.actions;
export default uiSlice.reducer;
