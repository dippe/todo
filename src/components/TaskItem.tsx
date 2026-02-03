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

export const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  completed,
  onToggle,
  onDelete,
  onEdit,
}) => {
  return (
    <li
      className="flex items-center gap-3 p-3 border-b border-border last:border-b-0"
      role="listitem"
    >
      <Checkbox
        id={`task-${id}`}
        checked={completed}
        onCheckedChange={() => onToggle(id)}
        aria-label={`Mark ${title} as ${completed ? 'incomplete' : 'complete'}`}
        className="min-h-[44px] min-w-[44px]"
      />
      <label
        htmlFor={`task-${id}`}
        className={`flex-1 cursor-pointer select-none ${
          completed ? 'line-through text-muted-foreground' : ''
        }`}
      >
        {title}
      </label>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(id)}
          aria-label={`Edit ${title}`}
          className="min-h-[44px] min-w-[44px]"
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(id)}
          aria-label={`Delete ${title}`}
          className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
        >
          Delete
        </Button>
      </div>
    </li>
  );
};

TaskItem.displayName = 'TaskItem';

export default TaskItem;
