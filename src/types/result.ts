/**
 * Result type for functional error handling
 * Replaces exceptions with explicit error handling
 * @see specs/001-todo-pwa-app/data-model.md
 */

/**
 * Result type representing success or failure
 * @template T - Success value type
 * @template E - Error type (defaults to string)
 */
export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * Creates a success result
 * @param value - The success value
 * @returns Success result containing the value
 */
export const ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

/**
 * Creates an error result
 * @param error - The error value
 * @returns Error result containing the error
 */
export const err = <T = never, E = string>(error: E): Result<T, E> => ({
  ok: false,
  error,
});

/**
 * Type guard for success results
 * @param result - The result to check
 * @returns true if result is a success
 */
export const isOk = <T, E>(
  result: Result<T, E>
): result is { readonly ok: true; readonly value: T } => result.ok;

/**
 * Type guard for error results
 * @param result - The result to check
 * @returns true if result is an error
 */
export const isErr = <T, E>(
  result: Result<T, E>
): result is { readonly ok: false; readonly error: E } => !result.ok;
