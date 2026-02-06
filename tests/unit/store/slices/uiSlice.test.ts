import uiReducer, {
  setNotification,
  clearNotification,
} from '../../../../src/store/slices/uiSlice';
import { UIState } from '../../../../src/types/state';

describe('uiSlice', () => {
  const initialState: UIState = {
    notification: null,
  };

  it('should handle initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setNotification', () => {
    const payload = { message: 'Test message', type: 'success' as const };
    const actual = uiReducer(initialState, setNotification(payload));

    expect(actual.notification).toEqual(
      expect.objectContaining({
        message: 'Test message',
        type: 'success',
      })
    );
    expect(actual.notification?.id).toBeDefined();
    expect(typeof actual.notification?.id).toBe('string');
  });

  it('should generate unique IDs for setNotification', () => {
    const payload = { message: 'Test message', type: 'success' as const };
    const state1 = uiReducer(initialState, setNotification(payload));
    const state2 = uiReducer(initialState, setNotification(payload));

    expect(state1.notification?.id).not.toBe(state2.notification?.id);
  });

  it('should handle clearNotification', () => {
    const startState: UIState = {
      notification: { message: 'Test', type: 'error', id: '123' },
    };
    const actual = uiReducer(startState, clearNotification());
    expect(actual.notification).toBeNull();
  });
});
