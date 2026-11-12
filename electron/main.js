const path = require('node:path');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');

const isDev = process.argv.includes('--dev');

const WINDOW_WIDTH = 640;
const WINDOW_HEIGHT = 576;

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

  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

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
