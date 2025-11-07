import { create } from 'zustand';
import { Task, Session, Settings, TimerState, AnalyticsData } from './types';

interface AppState {
  // Tasks
  tasks: Task[];
  loadTasks: () => Promise<void>;
  addTask: (title: string, estimatedPomodoros: number) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  reorderTasks: (taskIds: number[]) => Promise<void>;

  // Timer
  timer: TimerState;
  setTimer: (updates: Partial<TimerState>) => void;
  startTimer: (taskId?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (completed: boolean) => Promise<void>;
  tick: () => void;

  // Settings
  settings: Settings;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;

  // Focus Mode
  focusMode: {
    isActive: boolean;
    isFullscreen: boolean;
    sitesBlocked: boolean;
  };
  enableFocusMode: () => Promise<void>;
  disableFocusMode: () => Promise<void>;

  // Analytics
  analytics: AnalyticsData | null;
  loadAnalytics: (days?: number) => Promise<void>;

  // UI State
  currentView: 'timer' | 'tasks' | 'analytics' | 'settings';
  setCurrentView: (view: 'timer' | 'tasks' | 'analytics' | 'settings') => void;
}

const defaultSettings: Settings = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  pomodorosUntilLongBreak: 4,
  enableSounds: true,
  enableMusic: false,
  blockedSites: []
};

const defaultTimer: TimerState = {
  isRunning: false,
  isPaused: false,
  timeLeft: 25 * 60,
  totalTime: 25 * 60,
  currentType: 'work',
  completedPomodoros: 0,
  currentTaskId: null,
  sessionStartTime: null
};

export const useStore = create<AppState>((set, get) => ({
  // Tasks
  tasks: [],

  loadTasks: async () => {
    const tasks = await window.electron.db.getTasks();
    set({ tasks });
  },

  addTask: async (title, estimatedPomodoros) => {
    await window.electron.db.addTask(title, estimatedPomodoros);
    await get().loadTasks();
  },

  updateTask: async (id, updates) => {
    await window.electron.db.updateTask(id, updates);
    await get().loadTasks();
  },

  deleteTask: async (id) => {
    await window.electron.db.deleteTask(id);
    await get().loadTasks();
  },

  reorderTasks: async (taskIds) => {
    await window.electron.db.reorderTasks(taskIds);
    await get().loadTasks();
  },

  // Timer
  timer: defaultTimer,

  setTimer: (updates) => {
    set((state) => ({
      timer: { ...state.timer, ...updates }
    }));
  },

  startTimer: (taskId) => {
    const { settings, timer } = get();
    const duration = settings.workDuration * 60;

    set({
      timer: {
        ...timer,
        isRunning: true,
        isPaused: false,
        timeLeft: duration,
        totalTime: duration,
        currentType: 'work',
        currentTaskId: taskId || null,
        sessionStartTime: Date.now()
      }
    });

    get().enableFocusMode();
  },

  pauseTimer: () => {
    set((state) => ({
      timer: { ...state.timer, isRunning: false, isPaused: true }
    }));
  },

  resumeTimer: () => {
    set((state) => ({
      timer: { ...state.timer, isRunning: true, isPaused: false }
    }));
  },

  stopTimer: async (completed) => {
    const { timer, settings } = get();

    // Save session if there was one
    if (timer.sessionStartTime && timer.currentType === 'work') {
      const session: Session = {
        task_id: timer.currentTaskId,
        start_time: Math.floor(timer.sessionStartTime / 1000),
        end_time: Math.floor(Date.now() / 1000),
        duration: Math.floor((Date.now() - timer.sessionStartTime) / 1000),
        type: timer.currentType,
        completed
      };

      try {
        await window.electron.db.addSession(session);

        if (completed && timer.currentTaskId) {
          const task = get().tasks.find(t => t.id === timer.currentTaskId);
          if (task) {
            await get().updateTask(timer.currentTaskId, {
              completed_pomodoros: task.completed_pomodoros + 1
            });
          }
        }
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }

    // If completed, start break timer
    if (completed && timer.currentType === 'work') {
      const newCompletedCount = timer.completedPomodoros + 1;
      const isLongBreak = newCompletedCount % settings.pomodorosUntilLongBreak === 0;
      const breakDuration = isLongBreak ? settings.longBreak : settings.shortBreak;

      // Show notification
      try {
        await window.electron.notification.show(
          'Pomodoro terminé !',
          `Bien joué ! Prenez une pause de ${breakDuration} minutes.`
        );
      } catch (error) {
        console.error('Error showing notification:', error);
      }

      // Start break
      set({
        timer: {
          ...defaultTimer,
          timeLeft: breakDuration * 60,
          totalTime: breakDuration * 60,
          currentType: isLongBreak ? 'long-break' : 'short-break',
          completedPomodoros: newCompletedCount,
          isRunning: true,
          sessionStartTime: Date.now()
        }
      });

      await get().disableFocusMode();
    } else {
      // If stopped manually or break ended, reset timer completely
      set({ timer: defaultTimer });
      await get().disableFocusMode();
    }

    await get().loadAnalytics();
  },

  tick: () => {
    const { timer } = get();
    if (timer.isRunning && timer.timeLeft > 0) {
      set({
        timer: { ...timer, timeLeft: timer.timeLeft - 1 }
      });
    } else if (timer.isRunning && timer.timeLeft === 0) {
      get().stopTimer(true);
    }
  },

  // Settings
  settings: defaultSettings,

  loadSettings: async () => {
    const settingsData = await window.electron.db.getSettings();
    set({
      settings: {
        workDuration: parseInt(settingsData.workDuration) || 25,
        shortBreak: parseInt(settingsData.shortBreak) || 5,
        longBreak: parseInt(settingsData.longBreak) || 15,
        pomodorosUntilLongBreak: parseInt(settingsData.pomodorosUntilLongBreak) || 4,
        enableSounds: settingsData.enableSounds === 'true',
        enableMusic: settingsData.enableMusic === 'true',
        blockedSites: settingsData.blockedSites || []
      }
    });
  },

  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };

    for (const [key, value] of Object.entries(updates)) {
      await window.electron.db.updateSetting(key, String(value));
    }

    set({ settings: newSettings });
  },

  // Focus Mode
  focusMode: {
    isActive: false,
    isFullscreen: false,
    sitesBlocked: false
  },

  enableFocusMode: async () => {
    try {
      await window.electron.focus.blockSites();
      await window.electron.focus.preventSleep();

      set({
        focusMode: {
          isActive: true,
          isFullscreen: false,
          sitesBlocked: true
        }
      });
    } catch (error) {
      console.error('Error enabling focus mode:', error);
    }
  },

  disableFocusMode: async () => {
    try {
      await window.electron.focus.unblockSites();
      await window.electron.focus.allowSleep();
      await window.electron.focus.disableFullscreen();

      set({
        focusMode: {
          isActive: false,
          isFullscreen: false,
          sitesBlocked: false
        }
      });
    } catch (error) {
      console.error('Error disabling focus mode:', error);
    }
  },

  // Analytics
  analytics: null,

  loadAnalytics: async (days = 30) => {
    const startDate = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
    const sessions = await window.electron.db.getSessions(startDate);

    const workSessions = sessions.filter((s: Session) => s.type === 'work' && s.completed);

    // Calculate daily stats
    const dailyMap = new Map<string, DayStats>();
    const hourlyHeatmap = Array(24).fill(0);

    workSessions.forEach((session: Session) => {
      const date = new Date(session.start_time * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const hour = date.getHours();

      hourlyHeatmap[hour]++;

      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, {
          date: dateStr,
          pomodoros: 0,
          focusTime: 0,
          tasksCompleted: 0
        });
      }

      const dayStats = dailyMap.get(dateStr)!;
      dayStats.pomodoros++;
      dayStats.focusTime += session.duration || 0;
    });

    // Calculate streaks
    const sortedDates = Array.from(dailyMap.keys()).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const date = sortedDates[i];
      if (i === sortedDates.length - 1 && date === today) {
        currentStreak = 1;
        tempStreak = 1;
      } else if (i < sortedDates.length - 1) {
        const prevDate = new Date(sortedDates[i + 1]);
        const currDate = new Date(date);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          if (i === sortedDates.length - 2 || (i === sortedDates.length - 1 && date === today)) {
            currentStreak = tempStreak;
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    set({
      analytics: {
        totalPomodoros: workSessions.length,
        totalFocusTime: workSessions.reduce((sum: number, s: Session) => sum + (s.duration || 0), 0),
        totalTasks: get().tasks.filter(t => t.completed).length,
        currentStreak,
        longestStreak,
        dailyStats: Array.from(dailyMap.values()),
        hourlyHeatmap
      }
    });
  },

  // UI State
  currentView: 'timer',

  setCurrentView: (view) => {
    set({ currentView: view });
  }
}));

// Start timer interval
setInterval(() => {
  const state = useStore.getState();
  if (state.timer.isRunning) {
    state.tick();
  }
}, 1000);
