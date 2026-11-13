const fs = require('node:fs');
const path = require('node:path');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');

const isDev = process.argv.includes('--dev');

const WINDOW_WIDTH = 640;
const WINDOW_HEIGHT = 576;
const SCREEN_WIDTH = 160;
const SCREEN_HEIGHT = 144;
const SCALES = [2, 3, 4, 5, 6];

const optionsPath = () => path.join(app.getPath('userData'), 'options.json');

function createWindow() {
  const win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    useContentSize: true,
    resizable: true,
    backgroundColor: '#000000',
    title: 'Bestiora Azur',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once('ready-to-show', () => win.show());

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      event.preventDefault();
      win.setFullScreen(!win.isFullScreen());
    }
  });

  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event) => event.preventDefault());

  // --newgame (with --dev): start on the title screen instead of the test map.
  const query = process.argv.includes('--newgame') ? { newgame: '1' } : {};
  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'), { query });

  if (isDev) {
    // Not activated: the game pauses when its window loses focus.
    win.webContents.openDevTools({ mode: 'detach', activate: false });
  }
}

function registerIpc() {
  ipcMain.on('app:is-dev', (event) => {
    event.returnValue = isDev;
  });

  ipcMain.on('window:toggle-fullscreen', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.setFullScreen(!win.isFullScreen());
  });

  ipcMain.on('window:set-fullscreen', (event, enabled) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && win.isFullScreen() !== enabled) win.setFullScreen(enabled);
  });

  ipcMain.on('window:set-scale', (event, scale) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win || win.isFullScreen() || !SCALES.includes(scale)) return;
    win.setContentSize(SCREEN_WIDTH * scale, SCREEN_HEIGHT * scale);
  });

  // Options file, separate from the save. Written with a temporary file and a rename.
  ipcMain.handle('options:write', (event, json) => {
    try {
      JSON.parse(json);
      const temporary = `${optionsPath()}.tmp`;
      fs.writeFileSync(temporary, json, 'utf8');
      fs.renameSync(temporary, optionsPath());
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });
  ipcMain.handle('options:read', () => {
    try {
      return JSON.parse(fs.readFileSync(optionsPath(), 'utf8'));
    } catch {
      return null;
    }
  });

  // Stubs: real atomic save/load is implemented in prompt 12.
  ipcMain.handle('save:write', () => ({ ok: false, error: 'not_implemented' }));
  ipcMain.handle('save:read', () => null);
}

app.whenReady().then(() => {
  if (!isDev) Menu.setApplicationMenu(null);
  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
