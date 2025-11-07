import { useStore } from '../store';

const Navigation = () => {
  const { currentView, setCurrentView, focusMode } = useStore();

  return (
    <nav className="navigation">
      <div className="navigation-logo">
        <span>🎯</span>
        <span>Focus Flow</span>
      </div>

      {focusMode.isActive && (
        <div className="badge badge-success">
          Mode Focus Actif
        </div>
      )}

      <div className="navigation-links">
        <button
          className={`nav-button ${currentView === 'timer' ? 'active' : ''}`}
          onClick={() => setCurrentView('timer')}
        >
          ⏱️ Timer
        </button>
        <button
          className={`nav-button ${currentView === 'tasks' ? 'active' : ''}`}
          onClick={() => setCurrentView('tasks')}
        >
          ✅ Tâches
        </button>
        <button
          className={`nav-button ${currentView === 'analytics' ? 'active' : ''}`}
          onClick={() => setCurrentView('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={`nav-button ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentView('settings')}
        >
          ⚙️ Paramètres
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
