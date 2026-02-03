import { Result } from '../types/result';
import { TASK_TITLE_MAX_LENGTH, TASK_MAX_COUNT, TaskList } from '../types/task';

/**
 * Validation result with specific error fields
 */
export interface ValidationErrors {
  title?: string;
}

/**
 * Validate task title input
 * @param title - Raw title input
 * @returns Result with trimmed title or validation errors
 */
export const validateTaskTitle = (title: string): Result<string, ValidationErrors> => {
  const errors: ValidationErrors = {};
  const trimmed = title.trim();
  
  if (trimmed.length === 0) {
    errors.title = 'Title cannot be empty';
  } else if (trimmed.length > TASK_TITLE_MAX_LENGTH) {
    errors.title = `Title cannot exceed ${TASK_TITLE_MAX_LENGTH} characters`;
  }
  
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: errors };
  }
  
  return { ok: true, data: trimmed };
};

/**
 * Check if task list has reached maximum capacity
 * @param tasks - Current task list
 * @returns Result with void or error message
 */
export const validateStorageCapacity = (tasks: TaskList): Result<void, string> => {
  if (tasks.length >= TASK_MAX_COUNT) {
    return { 
      ok: false, 
      error: `Maximum task limit reached (${TASK_MAX_COUNT})` 
    };
  }
  
  return { ok: true, data: undefined };
};
