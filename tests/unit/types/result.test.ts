/**
 * Unit tests for Result type
 * @module tests/unit/types/result
 */

import {
  type Result,
  createSuccess,
  createFailure,
  isSuccess,
  isFailure,
} from '../../../src/types/result';

describe('Result Type', () => {
  describe('createSuccess', () => {
    it('should create a success result with data', () => {
      // Arrange
      const data = { id: 1, name: 'test' };

      // Act
      const result = createSuccess(data);

      // Assert
      expect(result).toEqual({ ok: true, data });
    });

    it('should create a success result with null data', () => {
      // Act
      const result = createSuccess(null);

      // Assert
      expect(result).toEqual({ ok: true, data: null });
    });

    it('should create a success result with string data', () => {
      // Act
      const result = createSuccess('success message');

      // Assert
      expect(result).toEqual({ ok: true, data: 'success message' });
    });

    it('should create a success result with number data', () => {
      // Act
      const result = createSuccess(42);

      // Assert
      expect(result).toEqual({ ok: true, data: 42 });
    });

    it('should create a success result with array data', () => {
      // Arrange
      const data = [1, 2, 3];

      // Act
      const result = createSuccess(data);

      // Assert
      expect(result).toEqual({ ok: true, data });
    });
  });

  describe('createFailure', () => {
    it('should create a failure result with error', () => {
      // Arrange
      const error = new Error('Something went wrong');

      // Act
      const result = createFailure(error);

      // Assert
      expect(result).toEqual({ ok: false, error });
    });

    it('should create a failure result with string error', () => {
      // Arrange
      const error = 'Error message';

      // Act
      const result = createFailure(error);

      // Assert
      expect(result).toEqual({ ok: false, error });
    });

    it('should create a failure result with custom error object', () => {
      // Arrange
      const error = { code: 'ERR_001', message: 'Custom error' };

      // Act
      const result = createFailure(error);

      // Assert
      expect(result).toEqual({ ok: false, error });
    });

    it('should create a failure result with null error', () => {
      // Act
      const result = createFailure(null);

      // Assert
      expect(result).toEqual({ ok: false, error: null });
    });
  });

  describe('isSuccess', () => {
    it('should return true for a success result', () => {
      // Arrange
      const successResult: Result<string, Error> = { ok: true, data: 'test' };

      // Act
      const result = isSuccess(successResult);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for a failure result', () => {
      // Arrange
      const failureResult: Result<string, Error> = {
        ok: false,
        error: new Error('test'),
      };

      // Act
      const result = isSuccess(failureResult);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for null', () => {
      // Act
      const result = isSuccess(null);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      // Act
      const result = isSuccess(undefined);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an object without ok property', () => {
      // Arrange
      const invalidResult = { data: 'test' };

      // Act
      const result = isSuccess(invalidResult);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an object with ok set to false', () => {
      // Arrange
      const failureResult = { ok: false, error: 'test' };

      // Act
      const result = isSuccess(failureResult);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isFailure', () => {
    it('should return true for a failure result', () => {
      // Arrange
      const failureResult: Result<string, Error> = {
        ok: false,
        error: new Error('test'),
      };

      // Act
      const result = isFailure(failureResult);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for a success result', () => {
      // Arrange
      const successResult: Result<string, Error> = { ok: true, data: 'test' };

      // Act
      const result = isFailure(successResult);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for null', () => {
      // Act
      const result = isFailure(null);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      // Act
      const result = isFailure(undefined);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an object without ok property', () => {
      // Arrange
      const invalidResult = { error: 'test' };

      // Act
      const result = isFailure(invalidResult);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an object with ok set to true', () => {
      // Arrange
      const successResult = { ok: true, data: 'test' };

      // Act
      const result = isFailure(successResult);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Type discriminant property', () => {
    it('should have ok property as true for success', () => {
      // Arrange
      const success = createSuccess('data');

      // Assert
      expect(success.ok).toBe(true);
      expect('data' in success).toBe(true);
      expect('error' in success).toBe(false);
    });

    it('should have ok property as false for failure', () => {
      // Arrange
      const failure = createFailure('error');

      // Assert
      expect(failure.ok).toBe(false);
      expect('error' in failure).toBe(true);
      expect('data' in failure).toBe(false);
    });
  });
});
