import React from 'react';
import { Layout } from '@/components/Layout';
import TaskFormContainer from '@/containers/TaskFormContainer';
import TaskListContainer from '@/containers/TaskListContainer';
import EditTaskDialogContainer from '@/containers/EditTaskDialogContainer';

const App: React.FC = () => (
  <Layout>
    <div className="space-y-6">
      <section aria-label="Create new task">
        <TaskFormContainer />
      </section>
      <section aria-label="Task list">
        <TaskListContainer />
      </section>
    </div>
    <EditTaskDialogContainer />
  </Layout>
);

App.displayName = 'App';

export default App;
