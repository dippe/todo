import { ok, err, isOk, isErr } from '@/types/result';

describe('Result Type Utilities', () => {
  describe('ok', () => {
    it('should create success result with value', () => {
      const result = ok('test value');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('test value');
      }
    });

    it('should create success result with object', () => {
      const data = { name: 'test', count: 5 };
      const result = ok(data);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(data);
      }
    });

    it('should create success result with undefined', () => {
      const result = ok(undefined);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeUndefined();
      }
    });
  });

  describe('err', () => {
    it('should create error result with message', () => {
      const result = err('Something went wrong');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Something went wrong');
      }
    });

    it('should create error result with custom error type', () => {
      interface CustomError {
        code: number;
        message: string;
      }

      const result = err<string, CustomError>({
        code: 404,
        message: 'Not found',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe(404);
        expect(result.error.message).toBe('Not found');
      }
    });
  });

  describe('isOk', () => {
    it('should return true for success result', () => {
      const result = ok('value');
      expect(isOk(result)).toBe(true);
    });

    it('should return false for error result', () => {
      const result = err('error');
      expect(isOk(result)).toBe(false);
    });

    it('should narrow type correctly', () => {
      const result = ok('test');

      if (isOk(result)) {
        expect(result.value).toBe('test');
      }
    });
  });

  describe('isErr', () => {
    it('should return true for error result', () => {
      const result = err('error');
      expect(isErr(result)).toBe(true);
    });

    it('should return false for success result', () => {
      const result = ok('value');
      expect(isErr(result)).toBe(false);
    });

    it('should narrow type correctly', () => {
      const result = err('test error');

      if (isErr(result)) {
        expect(result.error).toBe('test error');
      }
    });
  });
});
