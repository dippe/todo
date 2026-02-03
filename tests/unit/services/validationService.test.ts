import { validateTaskTitle, validateStorageCapacity, ValidationErrors } from '../../../src/services/validationService';
import { TaskId, TaskList, Timestamp } from '../../../src/types/task';

describe('validationService', () => {
  describe('validateTaskTitle', () => {
    it('should validate valid title', () => {
      const result = validateTaskTitle('Valid task');
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBe('Valid task');
      }
    });
    
    it('should trim whitespace', () => {
      const result = validateTaskTitle('  Trimmed  ');
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBe('Trimmed');
      }
    });
    
    it('should reject empty string', () => {
      const result = validateTaskTitle('');
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.title).toContain('empty');
      }
    });
    
    it('should reject whitespace-only', () => {
      const result = validateTaskTitle('   ');
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.title).toContain('empty');
      }
    });
    
    it('should reject title exceeding max length', () => {
      const longTitle = 'a'.repeat(501);
      const result = validateTaskTitle(longTitle);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.title).toContain('500');
      }
    });
    
    it('should accept title at max length', () => {
      const maxTitle = 'a'.repeat(500);
      const result = validateTaskTitle(maxTitle);
      
      expect(result.ok).toBe(true);
    });
  });
  
  describe('validateStorageCapacity', () => {
    it('should pass for empty list', () => {
      const result = validateStorageCapacity([]);
      
      expect(result.ok).toBe(true);
    });
    
    it('should pass when under limit', () => {
      const tasks: TaskList = Array.from({ length: 100 }, (_, i) => ({
        id: `task-${i}` as TaskId,
        title: `Task ${i}`,
        completed: false,
        createdAt: Date.now() as Timestamp,
        updatedAt: Date.now() as Timestamp,
      }));
      
      const result = validateStorageCapacity(tasks);
      
      expect(result.ok).toBe(true);
    });
    
    it('should fail when at max limit', () => {
      const tasks: TaskList = Array.from({ length: 10000 }, (_, i) => ({
        id: `task-${i}` as TaskId,
        title: `Task ${i}`,
        completed: false,
        createdAt: Date.now() as Timestamp,
        updatedAt: Date.now() as Timestamp,
      }));
      
      const result = validateStorageCapacity(tasks);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('10,000');
      }
    });
  });
});
