import { useState } from 'react';
import { useStore } from '../store';
import './TaskList.css';

const TaskList = () => {
  const { tasks, addTask, updateTask, deleteTask } = useStore();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPomodoros, setNewTaskPomodoros] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      await addTask(newTaskTitle, newTaskPomodoros);
      setNewTaskTitle('');
      setNewTaskPomodoros(1);
      setIsAdding(false);
    }
  };

  const handleToggleComplete = async (taskId: number, completed: boolean) => {
    await updateTask(taskId, { completed: !completed });
  };

  const handleDelete = async (taskId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      await deleteTask(taskId);
    }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="tasklist-container container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📝 Mes Tâches</h2>
          <p className="card-subtitle">
            Organisez vos tâches et estimez le nombre de Pomodoros nécessaires
          </p>
        </div>

        {/* Add Task Form */}
        {!isAdding ? (
          <button
            className="btn btn-primary add-task-trigger"
            onClick={() => setIsAdding(true)}
          >
            ➕ Ajouter une tâche
          </button>
        ) : (
          <div className="add-task-form fade-in">
            <div className="input-group">
              <label>Titre de la tâche</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Ex: Rédiger le rapport"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              />
            </div>

            <div className="input-group">
              <label>Nombre de Pomodoros estimés</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newTaskPomodoros}
                onChange={(e) => setNewTaskPomodoros(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleAddTask}>
                Ajouter
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskTitle('');
                  setNewTaskPomodoros(1);
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <div className="tasks-section">
            <h3 className="section-title">En cours</h3>
            <div className="tasks-list">
              {activeTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-checkbox">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id, task.completed)}
                      id={`task-${task.id}`}
                    />
                    <label htmlFor={`task-${task.id}`}></label>
                  </div>

                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <span className="task-pomodoros">
                        🍅 {task.completed_pomodoros}/{task.estimated_pomodoros} Pomodoros
                      </span>
                      {task.completed_pomodoros > 0 && (
                        <div className="task-progress-bar">
                          <div
                            className="task-progress-fill"
                            style={{
                              width: `${(task.completed_pomodoros / task.estimated_pomodoros) * 100}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn-icon task-delete"
                    onClick={() => handleDelete(task.id)}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="tasks-section">
            <h3 className="section-title">✅ Terminées ({completedTasks.length})</h3>
            <div className="tasks-list">
              {completedTasks.map((task) => (
                <div key={task.id} className="task-item completed">
                  <div className="task-checkbox">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id, task.completed)}
                      id={`task-${task.id}`}
                    />
                    <label htmlFor={`task-${task.id}`}></label>
                  </div>

                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <span className="task-pomodoros">
                        🍅 {task.completed_pomodoros} Pomodoros
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn-icon task-delete"
                    onClick={() => handleDelete(task.id)}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && !isAdding && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>Aucune tâche pour le moment</p>
            <p className="empty-subtitle">Commencez par ajouter votre première tâche !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
