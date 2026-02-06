import { FC } from 'react';
import { Button } from './ui/button';

export interface TaskStatsProps {
  totalCount: number;
  completedCount: number;
  activeCount: number;
  onClearCompleted: () => void;
}

export const TaskStats: FC<TaskStatsProps> = ({
  completedCount,
  activeCount,
  onClearCompleted,
}) => {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </span>
      {completedCount > 0 && (
        <Button
          variant="link"
          size="sm"
          onClick={() => onClearCompleted()}
          aria-label="Clear completed tasks"
        >
          Clear completed
        </Button>
      )}
    </div>
  );
};
