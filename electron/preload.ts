import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Database operations
  db: {
    getTasks: () => ipcRenderer.invoke('db:getTasks'),
    addTask: (title: string, estimatedPomodoros: number) =>
      ipcRenderer.invoke('db:addTask', title, estimatedPomodoros),
    updateTask: (id: number, updates: any) =>
      ipcRenderer.invoke('db:updateTask', id, updates),
    deleteTask: (id: number) => ipcRenderer.invoke('db:deleteTask', id),
    reorderTasks: (taskIds: number[]) => ipcRenderer.invoke('db:reorderTasks', taskIds),
    getSessions: (startDate?: number, endDate?: number) =>
      ipcRenderer.invoke('db:getSessions', startDate, endDate),
    addSession: (session: any) => ipcRenderer.invoke('db:addSession', session),
    getSettings: () => ipcRenderer.invoke('db:getSettings'),
    updateSetting: (key: string, value: any) =>
      ipcRenderer.invoke('db:updateSetting', key, value)
  },

  // Focus mode operations
  focus: {
    blockSites: () => ipcRenderer.invoke('focus:blockSites'),
    unblockSites: () => ipcRenderer.invoke('focus:unblockSites'),
    enableFullscreen: () => ipcRenderer.invoke('focus:enableFullscreen'),
    disableFullscreen: () => ipcRenderer.invoke('focus:disableFullscreen'),
    preventSleep: () => ipcRenderer.invoke('focus:preventSleep'),
    allowSleep: () => ipcRenderer.invoke('focus:allowSleep')
  },

  // Notifications
  notification: {
    show: (title: string, body: string) =>
      ipcRenderer.invoke('notification:show', title, body)
  }
});

// Type definitions for TypeScript
export interface ElectronAPI {
  db: {
    getTasks: () => Promise<any[]>;
    addTask: (title: string, estimatedPomodoros: number) => Promise<{ id: number }>;
    updateTask: (id: number, updates: any) => Promise<{ success: boolean }>;
    deleteTask: (id: number) => Promise<{ success: boolean }>;
    reorderTasks: (taskIds: number[]) => Promise<{ success: boolean }>;
    getSessions: (startDate?: number, endDate?: number) => Promise<any[]>;
    addSession: (session: any) => Promise<{ id: number }>;
    getSettings: () => Promise<Record<string, any>>;
    updateSetting: (key: string, value: any) => Promise<{ success: boolean }>;
  };
  focus: {
    blockSites: () => Promise<{ success: boolean; error?: string }>;
    unblockSites: () => Promise<{ success: boolean; error?: string }>;
    enableFullscreen: () => Promise<{ success: boolean }>;
    disableFullscreen: () => Promise<{ success: boolean }>;
    preventSleep: () => Promise<{ success: boolean }>;
    allowSleep: () => Promise<{ success: boolean }>;
  };
  notification: {
    show: (title: string, body: string) => Promise<{ success: boolean }>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
