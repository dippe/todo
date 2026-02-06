import type { FC } from 'react';
import type { TaskFilter, TaskListMetrics } from '../types/state';
import { Button } from './ui/button';

export interface FilterBarProps {
  readonly currentFilter: TaskFilter;
  readonly onFilterChange: (filter: TaskFilter) => void;
  readonly counts: TaskListMetrics;
}

export const FilterBar: FC<FilterBarProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={currentFilter === 'all' ? 'default' : 'outline'}
        onClick={() => onFilterChange('all')}
        aria-pressed={currentFilter === 'all'}
      >
        All ({counts.total})
      </Button>
      <Button
        variant={currentFilter === 'active' ? 'default' : 'outline'}
        onClick={() => onFilterChange('active')}
        aria-pressed={currentFilter === 'active'}
      >
        Active ({counts.active})
      </Button>
      <Button
        variant={currentFilter === 'completed' ? 'default' : 'outline'}
        onClick={() => onFilterChange('completed')}
        aria-pressed={currentFilter === 'completed'}
      >
        Completed ({counts.completed})
      </Button>
    </div>
  );
};
