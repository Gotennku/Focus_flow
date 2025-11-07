import { useEffect } from 'react';
import { useStore } from './store';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const { currentView, loadTasks, loadSettings, loadAnalytics } = useStore();

  useEffect(() => {
    // Initialize app data
    loadSettings();
    loadTasks();
    loadAnalytics(30);
  }, []);

  return (
    <div className="app">
      <Navigation />
      <main className="app-main">
        {currentView === 'timer' && <Timer />}
        {currentView === 'tasks' && <TaskList />}
        {currentView === 'analytics' && <Analytics />}
        {currentView === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;
