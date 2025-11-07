export interface Task {
  id: number;
  title: string;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  completed: boolean;
  order_index: number;
  created_at: number;
}

export interface Session {
  id?: number;
  task_id: number | null;
  start_time: number;
  end_time: number | null;
  duration: number;
  type: 'work' | 'short-break' | 'long-break';
  completed: boolean;
  created_at?: number;
}

export interface Settings {
  workDuration: number;
  shortBreak: number;
  longBreak: number;
  pomodorosUntilLongBreak: number;
  enableSounds: boolean;
  enableMusic: boolean;
  blockedSites: string[];
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  totalTime: number;
  currentType: 'work' | 'short-break' | 'long-break';
  completedPomodoros: number;
  currentTaskId: number | null;
  sessionStartTime: number | null;
}

export interface DayStats {
  date: string;
  pomodoros: number;
  focusTime: number;
  tasksCompleted: number;
}

export interface AnalyticsData {
  totalPomodoros: number;
  totalFocusTime: number;
  totalTasks: number;
  currentStreak: number;
  longestStreak: number;
  dailyStats: DayStats[];
  hourlyHeatmap: number[];
}

export const MOTIVATIONAL_QUOTES = [
  "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.",
  "La seule façon de faire du bon travail est d'aimer ce que vous faites.",
  "Ne regardez pas l'horloge ; faites comme elle. Continuez d'avancer.",
  "Le secret pour avancer est de commencer.",
  "La concentration est la clé de l'excellence.",
  "Un voyage de mille lieues commence toujours par un premier pas.",
  "Le génie, c'est 1% d'inspiration et 99% de transpiration.",
  "Votre temps est limité, ne le gaspillez pas.",
  "La procrastination est le voleur du temps.",
  "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant."
];
