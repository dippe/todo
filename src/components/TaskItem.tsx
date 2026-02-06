import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TaskId } from '@/types/task';

interface TaskItemProps {
  readonly id: TaskId;
  readonly title: string;
  readonly completed: boolean;
  readonly onToggle: (id: TaskId) => void;
  readonly onDelete: (id: TaskId) => void;
  readonly onEdit: (id: TaskId) => void;
}

export const TaskItem: React.FC<TaskItemProps> = React.memo(
  ({ id, title, completed, onToggle, onDelete, onEdit }) => {
    return (
      <li className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-border last:border-b-0">
        <Checkbox
          id={`task-${id}`}
          checked={completed}
          onCheckedChange={() => onToggle(id)}
          aria-label={`Mark ${title} as ${completed ? 'incomplete' : 'complete'}`}
          className="min-h-[44px] min-w-[44px] touch-manipulation shrink-0"
        />
        <label
          htmlFor={`task-${id}`}
          className={`flex-1 cursor-pointer select-none text-sm sm:text-base ${
            completed ? 'line-through text-muted-foreground' : ''
          }`}
        >
          {title}
        </label>
        <div className="flex gap-1 sm:gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(id)}
            aria-label={`Edit ${title}`}
            className="min-h-[44px] min-w-[44px] touch-manipulation text-xs sm:text-sm"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(id)}
            aria-label={`Delete ${title}`}
            className="min-h-[44px] min-w-[44px] touch-manipulation text-destructive hover:text-destructive text-xs sm:text-sm"
          >
            Delete
          </Button>
        </div>
      </li>
    );
  }
);

TaskItem.displayName = 'TaskItem';

export default TaskItem;
