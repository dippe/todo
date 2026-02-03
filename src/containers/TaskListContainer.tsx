import React, { useCallback } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import TaskList from '@/components/TaskList';
import {
  toggleTask,
  deleteTask,
  setEditingId,
} from '@/store/slices/tasksSlice';
import { selectFilteredTasks } from '@/store/selectors';
import type { RootState } from '@/types/state';
import type { TaskId } from '@/types/task';

const mapStateToProps = (state: RootState) => ({
  tasks: selectFilteredTasks(state),
});

const mapDispatchToProps = {
  toggleTask,
  deleteTask,
  setEditingId,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const TaskListContainer: React.FC<PropsFromRedux> = ({
  tasks,
  toggleTask,
  deleteTask,
  setEditingId,
}) => {
  const handleToggle = useCallback(
    (id: TaskId): void => {
      toggleTask(id);
    },
    [toggleTask]
  );

  const handleDelete = useCallback(
    (id: TaskId): void => {
      deleteTask(id);
    },
    [deleteTask]
  );

  const handleEdit = useCallback(
    (id: TaskId): void => {
      setEditingId(id);
    },
    [setEditingId]
  );

  return (
    <TaskList
      tasks={tasks}
      onToggle={handleToggle}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );
};

TaskListContainer.displayName = 'TaskListContainer';

export default connector(TaskListContainer);
