/**
 * Result type definitions for functional error handling
 * @module types/result
 *
 * Implements a Result type inspired by Rust and functional programming.
 * Uses a discriminated union pattern for type-safe error handling.
 */

/**
 * Success variant of Result
 * @template T - The type of the successful value
 */
interface Success<T> {
  /** Discriminant property indicating success */
  readonly ok: true;
  /** The successful value */
  readonly data: T;
}

/**
 * Failure variant of Result
 * @template E - The type of the error value
 */
interface Failure<E> {
  /** Discriminant property indicating failure */
  readonly ok: false;
  /** The error value */
  readonly error: E;
}

/**
 * Result type representing either success with data or failure with error
 * @template T - The type of the successful value
 * @template E - The type of the error value
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, Error> {
 *   if (b === 0) {
 *     return createFailure(new Error('Division by zero'));
 *   }
 *   return createSuccess(a / b);
 * }
 *
 * const result = divide(10, 2);
 * if (isSuccess(result)) {
 *   console.log(result.data); // 5
 * }
 * ```
 */
export type Result<T, E> = Success<T> | Failure<E>;

/**
 * Creates a successful Result
 * @template T - The type of the data
 * @param data - The successful value to wrap
 * @returns A Success result containing the data
 */
export function createSuccess<T>(data: T): Success<T> {
  return { ok: true, data };
}

/**
 * Creates a failed Result
 * @template E - The type of the error
 * @param error - The error value to wrap
 * @returns A Failure result containing the error
 */
export function createFailure<E>(error: E): Failure<E> {
  return { ok: false, error };
}

/**
 * Type guard to check if a Result is a Success
 * @template T - The type of the data
 * @param result - The Result to check
 * @returns True if the Result is a Success
 */
export function isSuccess<T>(result: unknown): result is Success<T> {
  return (
    result !== null &&
    typeof result === 'object' &&
    'ok' in result &&
    result.ok === true
  );
}

/**
 * Type guard to check if a Result is a Failure
 * @template E - The type of the error
 * @param result - The Result to check
 * @returns True if the Result is a Failure
 */
export function isFailure<E>(result: unknown): result is Failure<E> {
  return (
    result !== null &&
    typeof result === 'object' &&
    'ok' in result &&
    result.ok === false
  );
}
