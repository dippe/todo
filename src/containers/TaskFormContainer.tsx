import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { TaskForm } from '@/components/TaskForm';
import {
  addTask,
  setFormInput,
  clearFormInput,
} from '@/store/slices/tasksSlice';
import { setNotification } from '@/store/slices/uiSlice';
import { selectMetrics } from '@/store/selectors';
import type { RootState } from '@/types/state';
import type { AppDispatch } from '@/store/store';

const mapStateToProps = (state: RootState) => ({
  value: state.taskList.formInput,
  taskCount: selectMetrics(state).total,
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  onChange: (value: string) => dispatch(setFormInput(value)),
  onSubmit: (title: string, currentCount: number) => {
    if (currentCount >= 10000) {
      dispatch(
        setNotification({
          message:
            'Task limit reached (10,000 tasks max). Cannot add new task.',
          type: 'error',
        })
      );
      return;
    }

    if (currentCount >= 9900) {
      dispatch(
        setNotification({
          message: 'Warning: Approaching task limit (10,000 tasks max).',
          type: 'error', // Using error type for visibility, or could add 'warning' type if supported
        })
      );
    }

    dispatch(addTask(title));
    dispatch(clearFormInput());
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const TaskFormContainer: React.FC<PropsFromRedux> = ({
  value,
  taskCount,
  onChange,
  onSubmit,
}) => {
  return (
    <TaskForm
      mode="create"
      value={value}
      onChange={onChange}
      onSubmit={(title) => onSubmit(title, taskCount)}
      submitLabel="Add Task"
      placeholder="What needs to be done?"
    />
  );
};

TaskFormContainer.displayName = 'TaskFormContainer';

export default connector(TaskFormContainer);
