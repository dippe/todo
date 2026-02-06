import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../types/state';
import { loadTasks } from '../store/slices/tasksSlice';
import { setNotification } from '../store/slices/uiSlice';
import { StorageControls } from '../components/StorageControls';
import * as storageService from '../services/storageService';

const mapState = (state: RootState) => ({
  tasks: state.taskList.items,
});

const mapDispatch = {
  loadTasks,
  setNotification,
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

const StorageControlsContainer: React.FC<PropsFromRedux> = ({
  tasks,
  loadTasks,
  setNotification,
}) => {
  const handleExport = () => {
    const result = storageService.exportTasks(tasks);
    if (!result.ok) {
      setNotification({ message: result.error, type: 'error' });
      return;
    }

    try {
      const blob = new Blob([result.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setNotification({
        message: 'Tasks exported successfully',
        type: 'success',
      });
    } catch (e) {
      setNotification({ message: 'Failed to download file', type: 'error' });
    }
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const result = storageService.importTasks(content);
      if (result.ok) {
        loadTasks(result.data);
        setNotification({
          message: 'Tasks imported successfully',
          type: 'success',
        });
      } else {
        setNotification({ message: result.error, type: 'error' });
      }
    };
    reader.onerror = () => {
      setNotification({ message: 'Failed to read file', type: 'error' });
    };
    reader.readAsText(file);
  };

  return <StorageControls onExport={handleExport} onImport={handleImport} />;
};

export default connector(StorageControlsContainer);
