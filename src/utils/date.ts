/**
 * Date utility functions
 * @module utils/date
 *
 * Provides functions for timestamp generation and date formatting.
 * All functions are pure and follow functional programming principles.
 */

import type { Timestamp } from '../types/task';

/**
 * Returns the current timestamp
 * Uses Date.now() to get Unix epoch milliseconds
 * @returns Current time as a branded Timestamp number
 * @example
 * const current = now(); // 1738598400000
 */
export function now(): Timestamp {
  return Date.now() as Timestamp;
}

/**
 * Formats a timestamp as a human-readable local date string
 * @param timestamp - The timestamp to format
 * @returns Formatted date string in locale format
 * @example
 * const formatted = formatDate(1738598400000); // '2/3/2026, 12:00:00 PM'
 */
export function formatDate(timestamp: Timestamp): string {
  return new Date(timestamp).toLocaleString();
}
