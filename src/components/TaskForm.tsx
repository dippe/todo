import React, { useRef } from 'react';
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

const getAriaLabel = (mode: 'create' | 'edit'): string =>
  mode === 'create' ? 'Add task' : 'Edit task title';

const FormButtons: React.FC<{
  readonly submitLabel: string;
  readonly onCancel?: () => void;
  readonly disabled: boolean;
}> = ({ submitLabel, onCancel, disabled }) => (
  <div className="flex gap-2 w-full sm:w-auto">
    <Button
      type="submit"
      aria-label={submitLabel}
      className="min-h-[44px] min-w-[44px] flex-1 sm:flex-none touch-manipulation"
      disabled={disabled}
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
);

FormButtons.displayName = 'FormButtons';

export const TaskForm: React.FC<TaskFormProps> = React.memo(
  ({
    mode,
    value,
    onChange,
    onSubmit,
    onCancel,
    submitLabel,
    placeholder = 'What needs to be done?',
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      const title = value.trim();

      if (title.length === 0) {
        return;
      }

      onSubmit(title);

      // Focus input after submit in create mode
      if (mode === 'create') {
        inputRef.current?.focus();
      }
    };

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ): void => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const title = value.trim();
        if (title.length > 0) {
          onSubmit(title);
          // Focus input after submit in create mode
          if (mode === 'create') {
            inputRef.current?.focus();
          }
        }
      }
    };

    const formAriaLabel = mode === 'create' ? 'Add new task' : 'Edit task';
    const inputAriaLabel = getAriaLabel(mode);
    const isDisabled = value.trim().length === 0 || value.trim().length > 500;

    return (
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-3 sm:flex-row sm:items-center"
        aria-label={formAriaLabel}
      >
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={inputAriaLabel}
          className="flex-1 min-h-[44px] touch-manipulation"
          maxLength={500}
        />
        <FormButtons
          submitLabel={submitLabel}
          onCancel={onCancel}
          disabled={isDisabled}
        />
      </form>
    );
  }
);

TaskForm.displayName = 'TaskForm';
