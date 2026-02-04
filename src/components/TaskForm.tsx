import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TaskFormProps {
  readonly mode: 'create' | 'edit';
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: (title: string) => void;
  readonly onCancel?: () => void;
  readonly submitLabel: string;
  readonly placeholder?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  mode,
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  placeholder = 'What needs to be done?',
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const title = value.trim();

    if (title.length === 0) {
      return;
    }

    onSubmit(title);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-center"
      aria-label={mode === 'create' ? 'Add new task' : 'Edit task'}
    >
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={mode === 'create' ? 'Add task' : 'Edit task title'}
        className="flex-1 min-h-[44px] touch-manipulation"
        maxLength={500}
      />
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          type="submit"
          aria-label={submitLabel}
          className="min-h-[44px] min-w-[44px] flex-1 sm:flex-none touch-manipulation"
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            aria-label="Cancel"
            className="min-h-[44px] min-w-[44px] flex-1 sm:flex-none touch-manipulation"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

TaskForm.displayName = 'TaskForm';
