import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TaskForm } from './TaskForm';

interface EditTaskDialogProps {
  readonly open: boolean;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSave: (title: string) => void;
  readonly onCancel: () => void;
}

/**
 * EditTaskDialog component
 * A modal dialog for editing an existing task title
 *
 * @param open - Controls dialog visibility
 * @param value - Current input value
 * @param onChange - Callback when input changes
 * @param onSave - Callback when user saves with new title
 * @param onCancel - Callback when user cancels editing
 *
 * Features:
 * - Uses TaskForm component in edit mode
 * - Validates non-empty, non-whitespace input
 * - Accessible with ARIA attributes and keyboard navigation (Enter/Escape)
 * - Auto-focuses input when opened (handled by TaskForm)
 */
export const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  open,
  value,
  onChange,
  onSave,
  onCancel,
}) => {
  const handleSubmit = (title: string): void => {
    onSave(title);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle id="edit-task-title">Edit Task</DialogTitle>
          <DialogDescription id="edit-task-description">
            Edit the title of your task
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          mode="edit"
          value={value}
          onChange={onChange}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel="Save"
          placeholder="Enter task title"
        />
      </DialogContent>
    </Dialog>
  );
};

EditTaskDialog.displayName = 'EditTaskDialog';

export default EditTaskDialog;
