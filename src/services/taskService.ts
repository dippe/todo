import { Task, TaskId, TaskList } from '../types/task';
import { Result } from '../types/result';
import { generateId } from '../utils/id';
import { now } from '../utils/date';

/**
 * Add a new task to the list
 * @param tasks - Current task list
 * @param title - Task title
 * @returns Result with new task list or error
 */
export const addTask = (
  tasks: TaskList,
  title: string
): Result<TaskList, string> => {
  const trimmed = title.trim();

  if (trimmed.length === 0) {
    return { ok: false, error: 'Title cannot be empty' };
  }

  if (trimmed.length > 500) {
    return { ok: false, error: 'Title cannot exceed 500 characters' };
  }

  const newTask: Task = {
    id: generateId(),
    title: trimmed,
    completed: false,
    createdAt: now(),
    updatedAt: now(),
  };

  return { ok: true, data: [...tasks, newTask] };
};

/**
 * Toggle task completion status
 * @param tasks - Current task list
 * @param id - Task ID to toggle
 * @returns Result with updated task list or error
 */
export const toggleTask = (
  tasks: TaskList,
  id: TaskId
): Result<TaskList, string> => {
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return { ok: false, error: 'Task not found' };
  }

  const updated = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed, updatedAt: now() } : t
  );

  return { ok: true, data: updated };
};

/**
 * Update task title
 * @param tasks - Current task list
 * @param id - Task ID to update
 * @param title - New title
 * @returns Result with updated task list or error
 */
export const updateTask = (
  tasks: TaskList,
  id: TaskId,
  title: string
): Result<TaskList, string> => {
  const trimmed = title.trim();

  if (trimmed.length === 0) {
    return { ok: false, error: 'Title cannot be empty' };
  }

  if (trimmed.length > 500) {
    return { ok: false, error: 'Title cannot exceed 500 characters' };
  }

  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return { ok: false, error: 'Task not found' };
  }

  const updated = tasks.map((t) =>
    t.id === id ? { ...t, title: trimmed, updatedAt: now() } : t
  );

  return { ok: true, data: updated };
};

/**
 * Delete a task from the list
 * @param tasks - Current task list
 * @param id - Task ID to delete
 * @returns Result with updated task list or error
 */
export const deleteTask = (
  tasks: TaskList,
  id: TaskId
): Result<TaskList, string> => {
  const filtered = tasks.filter((t) => t.id !== id);

  if (filtered.length === tasks.length) {
    return { ok: false, error: 'Task not found' };
  }

  return { ok: true, data: filtered };
};
