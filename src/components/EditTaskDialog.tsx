import React from 'react';
import { Task } from '@/types/task';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskForm } from './TaskForm';

interface EditTaskDialogProps {
  readonly open: boolean;
  readonly task: Task | undefined;
  readonly onSave: (title: string) => void;
  readonly onCancel: () => void;
}

/**
 * EditTaskDialog component
 * A modal dialog for editing an existing task title
 *
 * @param open - Controls dialog visibility
 * @param task - Task to edit (null when dialog should not render)
 * @param onSave - Callback when user saves with new title
 * @param onCancel - Callback when user cancels editing
 *
 * Features:
 * - Uses TaskForm component in edit mode
 * - Validates non-empty, non-whitespace input
 * - Accessible with ARIA attributes and keyboard navigation (Enter/Escape)
 * - Auto-focuses input when opened (handled by TaskForm)
 * - Returns null if no task provided
 */
export const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  open,
  task,
  onSave,
  onCancel,
}) => {
  // Return null if no task is provided
  if (!task) {
    return null;
  }

  const handleSubmit = (title: string): void => {
    onSave(title);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent
        aria-describedby="edit-task-description"
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle id="edit-task-title">Edit Task</DialogTitle>
          <span id="edit-task-description" className="sr-only">
            Edit the title of your task
          </span>
        </DialogHeader>
        <TaskForm
          mode="edit"
          initialValue={task.title}
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
