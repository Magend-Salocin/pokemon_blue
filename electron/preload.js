const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bestiora', {
  isDev: ipcRenderer.sendSync('app:is-dev'),
  save: (json) => ipcRenderer.invoke('save:write', json),
  load: () => ipcRenderer.invoke('save:read'),
  toggleFullscreen: () => ipcRenderer.send('window:toggle-fullscreen'),
  setFullscreen: (enabled) => ipcRenderer.send('window:set-fullscreen', Boolean(enabled)),
  setWindowScale: (scale) => ipcRenderer.send('window:set-scale', Number(scale)),
  saveOptions: (json) => ipcRenderer.invoke('options:write', json),
  loadOptions: () => ipcRenderer.invoke('options:read'),
});
