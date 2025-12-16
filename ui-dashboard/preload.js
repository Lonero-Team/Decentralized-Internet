/**
 * Preload script for Electron
 * Exposes safe APIs to the renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Component management
  getStatus: () => ipcRenderer.invoke('get-status'),
  startComponent: (component, config) => ipcRenderer.invoke('start-component', component, config),
  stopComponent: (component) => ipcRenderer.invoke('stop-component', component),
  getLogs: (component) => ipcRenderer.invoke('get-logs', component),
  
  // Monitoring
  getMetrics: () => ipcRenderer.invoke('get-metrics'),
  
  // Navigation
  onNavigateTo: (callback) => ipcRenderer.on('navigate-to', (event, page) => callback(page)),
  onShowAbout: (callback) => ipcRenderer.on('show-about', () => callback()),
  
  // Remove listeners
  removeNavigateListener: () => ipcRenderer.removeAllListeners('navigate-to'),
  removeAboutListener: () => ipcRenderer.removeAllListeners('show-about')
});
