import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TaskFormProps {
  readonly mode: 'create' | 'edit';
  readonly initialValue?: string;
  readonly onSubmit: (title: string) => void;
  readonly onCancel?: () => void;
  readonly submitLabel: string;
  readonly placeholder?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  mode,
  initialValue = '',
  onSubmit,
  onCancel,
  submitLabel,
  placeholder = 'What needs to be done?',
}) => {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const title = value.trim();

    if (title.length === 0) {
      return;
    }

    onSubmit(title);

    if (mode === 'create') {
      setValue('');
    }
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
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={mode === 'create' ? 'Add task' : 'Edit task title'}
        className="flex-1 min-h-[44px]"
        maxLength={500}
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          aria-label={submitLabel}
          className="min-h-[44px] min-w-[44px] flex-1 sm:flex-none"
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            aria-label="Cancel"
            className="min-h-[44px] min-w-[44px] flex-1 sm:flex-none"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

TaskForm.displayName = 'TaskForm';

export default TaskForm;
