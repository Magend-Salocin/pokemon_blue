const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bestiora', {
  isDev: ipcRenderer.sendSync('app:is-dev'),
  save: (json) => ipcRenderer.invoke('save:write', json),
  load: () => ipcRenderer.invoke('save:read'),
  toggleFullscreen: () => ipcRenderer.send('window:toggle-fullscreen'),
});
