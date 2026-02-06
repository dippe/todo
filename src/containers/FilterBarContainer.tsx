import { connect } from 'react-redux';
import { FilterBar } from '../components/FilterBar';
import type { RootState } from '../types/state';
import { setFilter } from '../store/slices/tasksSlice';
import { selectFilter, selectMetrics } from '../store/selectors';

const mapStateToProps = (state: RootState) => ({
  currentFilter: selectFilter(state),
  counts: selectMetrics(state),
});

const mapDispatchToProps = {
  onFilterChange: setFilter,
};

export default connect(mapStateToProps, mapDispatchToProps)(FilterBar);
