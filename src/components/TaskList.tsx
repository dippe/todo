import React from 'react';
import { Task, TaskId } from '@/types/task';
import TaskItem from './TaskItem';

interface TaskListProps {
  readonly tasks: readonly Task[];
  readonly onToggle: (id: TaskId) => void;
  readonly onDelete: (id: TaskId) => void;
  readonly onEdit: (id: TaskId) => void;
  readonly emptyMessage?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggle,
  onDelete,
  onEdit,
  emptyMessage = 'No tasks yet. Add one above!',
}) => {
  if (tasks.length === 0) {
    return (
      <div
        className="text-center py-6 sm:py-8 text-sm sm:text-base text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul
      className="divide-y divide-border rounded-md border border-border overflow-hidden"
      role="list"
      aria-label="Task list"
    >
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          id={task.id}
          title={task.title}
          completed={task.completed}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
};

TaskList.displayName = 'TaskList';

export default TaskList;
