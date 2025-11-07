import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { MOTIVATIONAL_QUOTES } from '../types';
import './Timer.css';

const Timer = () => {
  const {
    timer,
    tasks,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    settings,
    focusMode
  } = useStore();

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Random motivational quote
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(randomQuote);
  }, [timer.isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((timer.totalTime - timer.timeLeft) / timer.totalTime) * 100;
  };

  const handleStart = () => {
    startTimer(selectedTaskId || undefined);
  };

  const handleStop = async () => {
    try {
      await stopTimer(false);
      setSelectedTaskId(null);
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const currentTask = tasks.find(t => t.id === timer.currentTaskId);
  const isBreak = timer.currentType !== 'work';
  const isWork = timer.currentType === 'work';

  return (
    <div className="timer-container container">
      <div className="timer-card card">
        {/* Timer Display */}
        <div className="timer-display">
          <div className={`timer-circle ${timer.isRunning ? 'running' : ''}`}>
            <svg className="timer-progress" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="var(--bg-tertiary)"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={isBreak ? 'var(--success)' : 'var(--primary)'}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - getProgress() / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="timer-time">
              {formatTime(timer.timeLeft)}
            </div>
          </div>

          <div className="timer-info">
            <div className="timer-type">
              {isBreak ? (
                <>
                  {timer.currentType === 'long-break' ? '☕ Pause Longue' : '🍃 Pause Courte'}
                </>
              ) : (
                <>🔥 Session de Focus</>
              )}
            </div>

            {currentTask && isWork && (
              <div className="timer-task">
                Tâche : {currentTask.title}
              </div>
            )}

            {timer.completedPomodoros > 0 && (
              <div className="timer-streak">
                🔥 {timer.completedPomodoros} Pomodoro{timer.completedPomodoros > 1 ? 's' : ''} aujourd'hui
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          {!timer.isRunning && !timer.isPaused && (
            <>
              <div className="timer-task-select">
                <label>Sélectionner une tâche (optionnel) :</label>
                <select
                  value={selectedTaskId || ''}
                  onChange={(e) => setSelectedTaskId(e.target.value ? parseInt(e.target.value) : null)}
                  className="task-select"
                >
                  <option value="">Aucune tâche spécifique</option>
                  {tasks.filter(t => !t.completed).map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title} ({task.completed_pomodoros}/{task.estimated_pomodoros})
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary btn-large" onClick={handleStart}>
                ▶️ Démarrer Pomodoro
              </button>
            </>
          )}

          {timer.isRunning && !timer.isPaused && (
            <>
              <button className="btn btn-secondary" onClick={pauseTimer}>
                ⏸️ Pause
              </button>
              <button className="btn btn-danger" onClick={handleStop}>
                ⏹️ Arrêter
              </button>
            </>
          )}

          {timer.isPaused && (
            <>
              <button className="btn btn-primary" onClick={resumeTimer}>
                ▶️ Reprendre
              </button>
              <button className="btn btn-danger" onClick={handleStop}>
                ⏹️ Arrêter
              </button>
            </>
          )}
        </div>

        {/* Settings Info */}
        <div className="timer-settings-info">
          <div className="setting-item">
            <span>⏱️ Travail :</span>
            <span>{settings.workDuration} min</span>
          </div>
          <div className="setting-item">
            <span>☕ Pause courte :</span>
            <span>{settings.shortBreak} min</span>
          </div>
          <div className="setting-item">
            <span>🍃 Pause longue :</span>
            <span>{settings.longBreak} min</span>
          </div>
          <div className="setting-item">
            <span>🔄 Cycles avant pause longue :</span>
            <span>{settings.pomodorosUntilLongBreak}</span>
          </div>
        </div>

        {/* Focus Mode Status */}
        {focusMode.isActive && (
          <div className="focus-status">
            <div className="focus-status-header">
              <span>🛡️ Mode Focus Actif</span>
            </div>
            <div className="focus-status-items">
              {focusMode.sitesBlocked && (
                <span className="focus-status-item">✅ Sites bloqués</span>
              )}
              <span className="focus-status-item">✅ Veille désactivée</span>
            </div>
          </div>
        )}

        {/* Motivational Quote */}
        {timer.isRunning && !isBreak && (
          <div className="motivational-quote fade-in">
            <div className="quote-icon">💡</div>
            <div className="quote-text">"{quote}"</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timer;
