import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { EditTaskDialog } from '@/components/EditTaskDialog';
import { updateTask, setEditingId } from '@/store/slices/tasksSlice';
import type { RootState } from '@/types/state';

const mapStateToProps = (state: RootState) => {
  const editingId = state.taskList.editingId;
  const task =
    editingId !== null
      ? state.taskList.items.find((t) => t.id === editingId)
      : undefined;
  const open = editingId !== null;

  return {
    task,
    open,
    editingId,
  };
};

const mapDispatchToProps = {
  updateTask,
  setEditingId,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

const EditTaskDialogContainer: React.FC<PropsFromRedux> = ({
  task,
  open,
  editingId,
  updateTask,
  setEditingId,
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
    updateTask({ id: editingId, title: trimmedTitle });

    // Close dialog
    setEditingId(null);
  };

  const handleCancel = (): void => {
    setEditingId(null);
  };

  return (
    <EditTaskDialog
      task={task}
      open={open}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

EditTaskDialogContainer.displayName = 'EditTaskDialogContainer';

export default connector(EditTaskDialogContainer);
