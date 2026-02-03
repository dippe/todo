import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import TaskForm from '@/components/TaskForm';
import { addTask } from '@/store/slices/tasksSlice';
import type { RootState } from '@/types/state';

const mapStateToProps = (_state: RootState) => ({
  // No state needed for TaskForm - it's purely input-driven
});

const mapDispatchToProps = {
  addTask,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const TaskFormContainer: React.FC<PropsFromRedux> = ({ addTask }) => {
  return (
    <TaskForm
      mode="create"
      onSubmit={addTask}
      submitLabel="Add Task"
      placeholder="What needs to be done?"
    />
  );
};

TaskFormContainer.displayName = 'TaskFormContainer';

export default connector(TaskFormContainer);
