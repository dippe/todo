import React from 'react';
import { Layout } from '@/components/Layout';
import TaskFormContainer from '@/containers/TaskFormContainer';
import FilterBarContainer from '@/containers/FilterBarContainer';
import TaskListContainer from '@/containers/TaskListContainer';
import TaskStatsContainer from '@/containers/TaskStatsContainer';
import EditTaskDialogContainer from '@/containers/EditTaskDialogContainer';
import StorageControlsContainer from '@/containers/StorageControlsContainer';
import NotificationContainer from '@/containers/NotificationContainer';

const App: React.FC = () => (
  <Layout>
    <div className="space-y-6">
      <section aria-label="Data controls">
        <StorageControlsContainer />
      </section>
      <section aria-label="Create new task">
        <TaskFormContainer />
      </section>
      <section aria-label="Filter tasks">
        <FilterBarContainer />
      </section>
      <section aria-label="Task list">
        <TaskListContainer />
      </section>
      <section aria-label="Task statistics">
        <TaskStatsContainer />
      </section>
    </div>
    <EditTaskDialogContainer />
    <NotificationContainer />
  </Layout>
);

App.displayName = 'App';

export default App;
