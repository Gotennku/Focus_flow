import { app, BrowserWindow, ipcMain, Notification, powerSaveBlocker } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Database from 'better-sqlite3';
import hostile from 'hostile';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

// In development, use the Vite dev server URL
const isDev = process.env.NODE_ENV !== 'production';
export const VITE_DEV_SERVER_URL = isDev ? 'http://localhost:5173' : undefined;
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;
let db: Database.Database;
let powerSaveId: number | null = null;
let isFullscreenMode = false;
const blockedSites = [
  'youtube.com',
  'twitter.com',
  'facebook.com',
  'instagram.com',
  'reddit.com',
  'tiktok.com',
  'twitch.tv'
];

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: 'hiddenInset',
    frame: true
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  win.on('closed', () => {
    win = null;
  });
}

// Initialize SQLite database
function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'focusflow.db');
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      duration INTEGER,
      type TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      estimated_pomodoros INTEGER DEFAULT 1,
      completed_pomodoros INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT 0,
      order_index INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Set default settings
  const defaultSettings = {
    workDuration: '25',
    shortBreak: '5',
    longBreak: '15',
    pomodorosUntilLongBreak: '4',
    enableSounds: 'true',
    enableMusic: 'false',
    blockedSites: JSON.stringify(blockedSites)
  };

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  Object.entries(defaultSettings).forEach(([key, value]) => {
    insertSetting.run(key, value);
  });
}

// IPC Handlers
ipcMain.handle('db:getTasks', () => {
  return db.prepare('SELECT * FROM tasks WHERE completed = 0 ORDER BY order_index').all();
});

ipcMain.handle('db:addTask', (_, title: string, estimatedPomodoros: number) => {
  const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM tasks').get() as { max: number | null };
  const orderIndex = (maxOrder.max || 0) + 1;

  const result = db.prepare(
    'INSERT INTO tasks (title, estimated_pomodoros, order_index) VALUES (?, ?, ?)'
  ).run(title, estimatedPomodoros, orderIndex);

  return { id: result.lastInsertRowid };
});

ipcMain.handle('db:updateTask', (_, id: number, updates: any) => {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  db.prepare(`UPDATE tasks SET ${fields} WHERE id = ?`).run(...values, id);
  return { success: true };
});

ipcMain.handle('db:deleteTask', (_, id: number) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return { success: true };
});

ipcMain.handle('db:reorderTasks', (_, taskIds: number[]) => {
  const update = db.prepare('UPDATE tasks SET order_index = ? WHERE id = ?');
  taskIds.forEach((id, index) => {
    update.run(index, id);
  });
  return { success: true };
});

ipcMain.handle('db:getSessions', (_, startDate?: number, endDate?: number) => {
  let query = 'SELECT * FROM sessions WHERE completed = 1';
  const params: number[] = [];

  if (startDate) {
    query += ' AND start_time >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND start_time <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY start_time DESC';
  return db.prepare(query).all(...params);
});

ipcMain.handle('db:addSession', (_, session: any) => {
  const result = db.prepare(
    'INSERT INTO sessions (task_id, start_time, end_time, duration, type, completed) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(session.task_id, session.start_time, session.end_time, session.duration, session.type, session.completed);

  return { id: result.lastInsertRowid };
});

ipcMain.handle('db:getSettings', () => {
  const rows = db.prepare('SELECT * FROM settings').all() as { key: string; value: string }[];
  const settings: Record<string, any> = {};
  rows.forEach(row => {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  });
  return settings;
});

ipcMain.handle('db:updateSetting', (_, key: string, value: any) => {
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, valueStr);
  return { success: true };
});

// Focus mode handlers
ipcMain.handle('focus:blockSites', async () => {
  if (process.platform === 'win32' || process.platform === 'darwin' || process.platform === 'linux') {
    try {
      const settings = db.prepare('SELECT value FROM settings WHERE key = ?').get('blockedSites') as { value: string } | undefined;
      const sites = settings ? JSON.parse(settings.value) : blockedSites;

      for (const site of sites) {
        await new Promise<void>((resolve, reject) => {
          hostile.set('127.0.0.1', site, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Error blocking sites:', error);
      return { success: false, error: String(error) };
    }
  }
  return { success: false, error: 'Platform not supported' };
});

ipcMain.handle('focus:unblockSites', async () => {
  if (process.platform === 'win32' || process.platform === 'darwin' || process.platform === 'linux') {
    try {
      const settings = db.prepare('SELECT value FROM settings WHERE key = ?').get('blockedSites') as { value: string } | undefined;
      const sites = settings ? JSON.parse(settings.value) : blockedSites;

      for (const site of sites) {
        await new Promise<void>((resolve, reject) => {
          hostile.remove('127.0.0.1', site, (err) => {
            if (err && !err.message.includes('not found')) reject(err);
            else resolve();
          });
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Error unblocking sites:', error);
      return { success: false, error: String(error) };
    }
  }
  return { success: false, error: 'Platform not supported' };
});

ipcMain.handle('focus:enableFullscreen', () => {
  if (win && !isFullscreenMode) {
    win.setFullScreen(true);
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setKiosk(true);
    isFullscreenMode = true;
  }
  return { success: true };
});

ipcMain.handle('focus:disableFullscreen', () => {
  if (win && isFullscreenMode) {
    win.setFullScreen(false);
    win.setAlwaysOnTop(false);
    win.setKiosk(false);
    isFullscreenMode = false;
  }
  return { success: true };
});

ipcMain.handle('focus:preventSleep', () => {
  if (powerSaveId === null) {
    powerSaveId = powerSaveBlocker.start('prevent-display-sleep');
  }
  return { success: true };
});

ipcMain.handle('focus:allowSleep', () => {
  if (powerSaveId !== null) {
    powerSaveBlocker.stop(powerSaveId);
    powerSaveId = null;
  }
  return { success: true };
});

// Notification handler
ipcMain.handle('notification:show', (_, title: string, body: string) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
  return { success: true };
});

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Cleanup: unblock sites and allow sleep
  ipcMain.emit('focus:unblockSites');
  if (powerSaveId !== null) {
    powerSaveBlocker.stop(powerSaveId);
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (db) {
    db.close();
  }
});
