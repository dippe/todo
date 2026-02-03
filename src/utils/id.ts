/**
 * ID utility functions
 * @module utils/id
 *
 * Provides functions for generating unique identifiers for tasks.
 * All functions are pure and follow functional programming principles.
 */

import type { TaskId } from '../types/task';

/**
 * Generates a unique TaskId using UUID v4
 * Uses crypto.randomUUID() for cryptographically secure random values
 * @returns A new unique TaskId (branded string in UUID v4 format)
 * @example
 * const id = generateId(); // '550e8400-e29b-41d4-a716-446655440000'
 */
export function generateId(): TaskId {
  return crypto.randomUUID() as TaskId;
}
