import { connect } from 'react-redux';
import { TaskStats } from '../components/TaskStats';
import type { RootState } from '../types/state';
import { clearCompleted } from '../store/slices/tasksSlice';
import { selectMetrics } from '../store/selectors';

const mapStateToProps = (state: RootState) => {
  const metrics = selectMetrics(state);
  return {
    totalCount: metrics.total,
    completedCount: metrics.completed,
    activeCount: metrics.active,
  };
};

const mapDispatchToProps = {
  onClearCompleted: clearCompleted,
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskStats);
