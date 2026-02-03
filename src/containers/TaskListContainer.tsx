import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { TaskList } from '@/components/TaskList';
import {
  toggleTask,
  deleteTask,
  setEditingId,
} from '@/store/slices/tasksSlice';
import { selectFilteredTasks } from '@/store/selectors';
import type { RootState } from '@/types/state';

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
  return (
    <TaskList
      tasks={tasks}
      onToggle={toggleTask}
      onDelete={deleteTask}
      onEdit={setEditingId}
    />
  );
};

TaskListContainer.displayName = 'TaskListContainer';

export default connector(TaskListContainer);
