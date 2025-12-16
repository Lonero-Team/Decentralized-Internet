/**
 * Decentralized Internet UI - Main Electron Process
 * Central control panel for managing all SDK components
 */

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const SDKController = require('./src/controllers/sdk-controller');
const MonitoringService = require('./src/services/monitoring-service');
const CloudAgentsService = require('./src/services/cloud-agents-service');

let mainWindow;
let backendServer;
let io;
let sdkController;
let monitoringService;
let cloudAgentsService;

// Backend server for API
function createBackend() {
  const app = express();
  app.use(express.json());
  
  const server = http.createServer(app);
  io = socketIO(server);
  
  // Initialize services
  sdkController = new SDKController(io);
  monitoringService = new MonitoringService(io);
  cloudAgentsService = new CloudAgentsService(io);
  
  // API Routes
  app.get('/api/status', async (req, res) => {
    const status = await sdkController.getStatus();
    res.json(status);
  });
  
  app.post('/api/start/:component', async (req, res) => {
    const { component } = req.params;
    try {
      const result = await sdkController.startComponent(component, req.body);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.post('/api/stop/:component', async (req, res) => {
    const { component } = req.params;
    try {
      await sdkController.stopComponent(component);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.get('/api/logs/:component', async (req, res) => {
    const { component } = req.params;
    const logs = await sdkController.getLogs(component);
    res.json({ logs });
  });
  
  app.get('/api/monitoring/metrics', async (req, res) => {
    const metrics = await monitoringService.getMetrics();
    res.json(metrics);
  });
  
  app.post('/api/cloud-agents/execute', async (req, res) => {
    try {
      const result = await cloudAgentsService.executeTask(req.body);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // Socket.IO connections
  io.on('connection', (socket) => {
    console.log('Client connected to dashboard');
    
    socket.on('start-component', async (data) => {
      try {
        await sdkController.startComponent(data.component, data.config);
        socket.emit('component-started', { component: data.component });
      } catch (error) {
        socket.emit('component-error', { component: data.component, error: error.message });
      }
    });
    
    socket.on('stop-component', async (data) => {
      try {
        await sdkController.stopComponent(data.component);
        socket.emit('component-stopped', { component: data.component });
      } catch (error) {
        socket.emit('component-error', { component: data.component, error: error.message });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected from dashboard');
    });
  });
  
  const PORT = process.env.PORT || 9000;
  server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
  
  return server;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'public', 'icon.png'),
    title: 'Decentralized Internet Control Panel'
  });
  
  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
  }
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Create menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Components',
      submenu: [
        {
          label: 'Start All',
          click: async () => {
            await sdkController.startAll();
          }
        },
        {
          label: 'Stop All',
          click: async () => {
            await sdkController.stopAll();
          }
        },
        { type: 'separator' },
        {
          label: 'DecentG Mesh',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'decentg');
          }
        },
        {
          label: 'ClusterPost',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'clusterpost');
          }
        },
        {
          label: 'GridBee',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'gridbee');
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Open IDE',
          click: () => {
            const { shell } = require('electron');
            shell.openExternal('http://localhost:3001');
          }
        },
        {
          label: 'Cloud Agents',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'cloud-agents');
          }
        },
        {
          label: 'Network Monitor',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'monitoring');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            const { shell } = require('electron');
            shell.openExternal('https://github.com/Lonero-Team/Decentralized-Internet');
          }
        },
        {
          label: 'About',
          click: () => {
            mainWindow.webContents.send('show-about');
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App lifecycle
app.on('ready', () => {
  backendServer = createBackend();
  createWindow();
  
  // Start monitoring
  monitoringService.startMonitoring();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', async () => {
  // Cleanup
  if (monitoringService) {
    await monitoringService.stopMonitoring();
  }
  if (sdkController) {
    await sdkController.cleanup();
  }
  if (backendServer) {
    backendServer.close();
  }
});

// IPC handlers
ipcMain.handle('get-status', async () => {
  return await sdkController.getStatus();
});

ipcMain.handle('start-component', async (event, component, config) => {
  return await sdkController.startComponent(component, config);
});

ipcMain.handle('stop-component', async (event, component) => {
  return await sdkController.stopComponent(component);
});

ipcMain.handle('get-logs', async (event, component) => {
  return await sdkController.getLogs(component);
});

ipcMain.handle('get-metrics', async () => {
  return await monitoringService.getMetrics();
});
