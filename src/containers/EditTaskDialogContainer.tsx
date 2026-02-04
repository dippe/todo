import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { EditTaskDialog } from '@/components/EditTaskDialog';
import {
  updateTask,
  setEditingId,
  setEditingValue,
  type UpdateTaskPayload,
} from '@/store/slices/tasksSlice';
import type { RootState } from '@/types/state';
import type { AppDispatch } from '@/store/store';
import type { TaskId } from '@/types/task';

const mapStateToProps = (state: RootState) => {
  const editingId = state.taskList.editingId;
  const open = editingId !== null;

  return {
    open,
    editingId,
    editingValue: state.taskList.editingValue,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  onUpdateTask: (payload: UpdateTaskPayload) => dispatch(updateTask(payload)),
  onSetEditingId: (id: TaskId | null) => dispatch(setEditingId(id)),
  onEditingValueChange: (value: string) => dispatch(setEditingValue(value)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const EditTaskDialogContainer: React.FC<PropsFromRedux> = ({
  open,
  editingId,
  editingValue,
  onUpdateTask,
  onSetEditingId,
  onEditingValueChange,
}) => {
  const handleSave = (title: string): void => {
    if (editingId === null) {
      return;
    }

    // Validate title is non-empty and non-whitespace
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      return;
    }

    // Dispatch updateTask with id and new title
    onUpdateTask({ id: editingId, title: trimmedTitle });

    // Close dialog
    onSetEditingId(null);
  };

  const handleCancel = (): void => {
    onSetEditingId(null);
  };

  return (
    <EditTaskDialog
      value={editingValue}
      onChange={onEditingValueChange}
      open={open}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

EditTaskDialogContainer.displayName = 'EditTaskDialogContainer';

export default connector(EditTaskDialogContainer);
