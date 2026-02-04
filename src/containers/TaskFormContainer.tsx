import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { TaskForm } from '@/components/TaskForm';
import {
  addTask,
  setFormInput,
  clearFormInput,
} from '@/store/slices/tasksSlice';
import type { RootState } from '@/types/state';
import type { AppDispatch } from '@/store/store';

const mapStateToProps = (state: RootState) => ({
  value: state.taskList.formInput,
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  onChange: (value: string) => dispatch(setFormInput(value)),
  onSubmit: (title: string) => {
    dispatch(addTask(title));
    dispatch(clearFormInput());
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const TaskFormContainer: React.FC<PropsFromRedux> = ({
  value,
  onChange,
  onSubmit,
}) => {
  return (
    <TaskForm
      mode="create"
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
      submitLabel="Add Task"
      placeholder="What needs to be done?"
    />
  );
};

TaskFormContainer.displayName = 'TaskFormContainer';

export default connector(TaskFormContainer);
