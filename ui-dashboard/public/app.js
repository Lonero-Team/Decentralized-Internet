/**
 * Decentralized Internet UI - Frontend Application
 */

// Initialize Socket.IO connection
const socket = io('http://localhost:9000');

// Global state
let components = {};
let metrics = {};
let performanceChart, networkChart, realtimeChart;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
  setupEventListeners();
  setupSocketListeners();
  loadInitialData();
  
  // Set up charts
  setupCharts();
  
  // Start periodic updates
  setInterval(updateDashboard, 5000);
});

/**
 * Initialize UI components
 */
function initializeUI() {
  console.log('Initializing UI...');
  
  // Setup navigation
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateToPage(page);
    });
  });
}

/**
 * Navigate to a page
 */
function navigateToPage(pageName) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === pageName) {
      item.classList.add('active');
    }
  });
  
  // Update pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  const targetPage = document.getElementById(`${pageName}Page`);
  if (targetPage) {
    targetPage.classList.add('active');
    document.getElementById('pageTitle').textContent = 
      pageName.charAt(0).toUpperCase() + pageName.slice(1);
  }
  
  // Load page-specific data
  loadPageData(pageName);
}

/**
 * Load page-specific data
 */
function loadPageData(pageName) {
  switch (pageName) {
    case 'network':
      loadNetworkMap();
      break;
    case 'cloud-agents':
      loadCloudAgentsData();
      break;
    case 'logs':
      loadLogs();
      break;
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Start/Stop All buttons
  document.getElementById('startAllBtn').addEventListener('click', startAllComponents);
  document.getElementById('stopAllBtn').addEventListener('click', stopAllComponents);
  
  // Refresh button
  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadInitialData();
    showNotification('Data refreshed', 'success');
  });
  
  // IDE button
  document.getElementById('ideBtn').addEventListener('click', () => {
    window.open('http://localhost:3001', '_blank');
  });
  
  // Task buttons
  document.querySelectorAll('.task-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskType = btn.dataset.task;
      executeCloudAgentTask(taskType);
    });
  });
  
  // Network controls
  const refreshNetworkBtn = document.getElementById('refreshNetworkBtn');
  if (refreshNetworkBtn) {
    refreshNetworkBtn.addEventListener('click', loadNetworkMap);
  }
  
  // Clear logs
  const clearLogsBtn = document.getElementById('clearLogsBtn');
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', clearLogs);
  }
}

/**
 * Setup Socket.IO listeners
 */
function setupSocketListeners() {
  socket.on('connect', () => {
    console.log('Connected to backend');
    updateConnectionStatus(true);
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from backend');
    updateConnectionStatus(false);
  });
  
  socket.on('component-started', (data) => {
    console.log('Component started:', data.component);
    showNotification(`${data.component} started`, 'success');
    updateComponentStatus(data.component, 'running');
  });
  
  socket.on('component-stopped', (data) => {
    console.log('Component stopped:', data.component);
    showNotification(`${data.component} stopped`, 'info');
    updateComponentStatus(data.component, 'stopped');
  });
  
  socket.on('component-error', (data) => {
    console.error('Component error:', data);
    showNotification(`${data.component} error: ${data.error}`, 'error');
  });
  
  socket.on('component-log', (data) => {
    addLogEntry(data.component, data.log);
  });
  
  socket.on('metrics-update', (data) => {
    metrics = data;
    updateMetricsDisplay(data);
  });
  
  socket.on('task-started', (data) => {
    addTaskToHistory(data);
  });
  
  socket.on('task-completed', (data) => {
    updateTaskInHistory(data);
    showNotification(`Task completed: ${data.type}`, 'success');
  });
  
  socket.on('task-failed', (data) => {
    updateTaskInHistory(data);
    showNotification(`Task failed: ${data.type}`, 'error');
  });
}

/**
 * Load initial data
 */
async function loadInitialData() {
  try {
    const response = await fetch('http://localhost:9000/api/status');
    const status = await response.json();
    
    components = status;
    updateComponentsDisplay(status);
    
    // Load metrics
    const metricsResponse = await fetch('http://localhost:9000/api/monitoring/metrics');
    metrics = await metricsResponse.json();
    updateMetricsDisplay(metrics);
    
  } catch (error) {
    console.error('Failed to load initial data:', error);
    showNotification('Failed to connect to backend', 'error');
  }
}

/**
 * Update dashboard
 */
function updateDashboard() {
  if (document.getElementById('dashboardPage').classList.contains('active')) {
    loadInitialData();
  }
}

/**
 * Update components display
 */
function updateComponentsDisplay(status) {
  const componentsList = document.getElementById('componentsList');
  const componentCards = document.getElementById('componentCards');
  
  if (componentsList) {
    componentsList.innerHTML = '';
    
    Object.keys(status).forEach(key => {
      const component = status[key];
      const item = document.createElement('div');
      item.className = 'component-item';
      item.innerHTML = `
        <div class="component-info">
          <div class="component-name">${component.name || key}</div>
          <div class="component-status">
            Status: <span class="${component.status}">${component.status}</span>
            ${component.port ? `| Port: ${component.port}` : ''}
          </div>
        </div>
        <div class="component-actions">
          <button class="btn btn-sm btn-success" onclick="startComponent('${key}')">▶️ Start</button>
          <button class="btn btn-sm btn-danger" onclick="stopComponent('${key}')">⏹️ Stop</button>
        </div>
      `;
      componentsList.appendChild(item);
    });
  }
  
  if (componentCards) {
    componentCards.innerHTML = '';
    
    Object.keys(status).forEach(key => {
      const component = status[key];
      const card = document.createElement('div');
      card.className = 'component-card';
      card.innerHTML = `
        <div class="component-card-header">
          <div>
            <h3>${component.name || key}</h3>
            <p style="color: var(--text-secondary); font-size: 12px;">${component.path || ''}</p>
          </div>
          <span class="component-card-status ${component.status}">${component.status}</span>
        </div>
        <div class="component-card-body">
          ${component.port ? `<p>Port: ${component.port}</p>` : ''}
          <p>Path: ${component.path || 'N/A'}</p>
        </div>
        <div class="component-card-footer">
          <button class="btn btn-success" onclick="startComponent('${key}')">▶️ Start</button>
          <button class="btn btn-danger" onclick="stopComponent('${key}')">⏹️ Stop</button>
          <button class="btn" onclick="viewLogs('${key}')">📝 Logs</button>
        </div>
      `;
      componentCards.appendChild(card);
    });
  }
}

/**
 * Update metrics display
 */
function updateMetricsDisplay(metricsData) {
  if (metricsData.system) {
    document.getElementById('cpuUsage').textContent = `${metricsData.system.cpu}%`;
    document.getElementById('memoryUsage').textContent = `${metricsData.system.memory.usedPercent}%`;
  }
  
  if (metricsData.components && metricsData.components.decentg) {
    document.getElementById('activePeers').textContent = metricsData.components.decentg.peers || 0;
    document.getElementById('activeRoutes').textContent = metricsData.components.decentg.routes || 0;
  }
  
  // Update charts
  updateCharts(metricsData);
}

/**
 * Setup charts
 */
function setupCharts() {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#a0a0a0' }
      },
      x: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#a0a0a0' }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#a0a0a0' }
      }
    }
  };
  
  // Performance Chart
  const perfCtx = document.getElementById('performanceChart');
  if (perfCtx) {
    performanceChart = new Chart(perfCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'CPU %',
          data: [],
          borderColor: '#00a8ff',
          backgroundColor: 'rgba(0, 168, 255, 0.1)',
          tension: 0.4
        }, {
          label: 'Memory %',
          data: [],
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          tension: 0.4
        }]
      },
      options: chartOptions
    });
  }
  
  // Network Chart
  const netCtx = document.getElementById('networkChart');
  if (netCtx) {
    networkChart = new Chart(netCtx, {
      type: 'bar',
      data: {
        labels: ['Peers', 'Routes', 'Connections'],
        datasets: [{
          label: 'Count',
          data: [0, 0, 0],
          backgroundColor: ['#00a8ff', '#2ecc71', '#f39c12']
        }]
      },
      options: chartOptions
    });
  }
}

/**
 * Update charts
 */
function updateCharts(metricsData) {
  if (performanceChart && metricsData.history) {
    const history = metricsData.history.slice(-20);
    performanceChart.data.labels = history.map((_, i) => i);
    performanceChart.data.datasets[0].data = history.map(h => h.cpu || 0);
    performanceChart.data.datasets[1].data = history.map(h => h.memory || 0);
    performanceChart.update();
  }
  
  if (networkChart && metricsData.components) {
    const decentg = metricsData.components.decentg || {};
    networkChart.data.datasets[0].data = [
      decentg.peers || 0,
      decentg.routes || 0,
      metricsData.network?.connections || 0
    ];
    networkChart.update();
  }
}

/**
 * Component actions
 */
async function startComponent(name) {
  try {
    const response = await fetch(`http://localhost:9000/api/start/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    
    if (result.success) {
      showNotification(`Starting ${name}...`, 'info');
    } else {
      showNotification(`Failed to start ${name}: ${result.error}`, 'error');
    }
  } catch (error) {
    showNotification(`Error starting ${name}`, 'error');
  }
}

async function stopComponent(name) {
  try {
    const response = await fetch(`http://localhost:9000/api/stop/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    
    if (result.success) {
      showNotification(`Stopping ${name}...`, 'info');
    } else {
      showNotification(`Failed to stop ${name}: ${result.error}`, 'error');
    }
  } catch (error) {
    showNotification(`Error stopping ${name}`, 'error');
  }
}

async function startAllComponents() {
  showNotification('Starting all components...', 'info');
  for (const name in components) {
    await startComponent(name);
  }
}

async function stopAllComponents() {
  showNotification('Stopping all components...', 'info');
  for (const name in components) {
    await stopComponent(name);
  }
}

function updateComponentStatus(name, status) {
  if (components[name]) {
    components[name].status = status;
    updateComponentsDisplay(components);
  }
}

/**
 * Cloud Agents
 */
async function executeCloudAgentTask(taskType) {
  showNotification(`Executing ${taskType} task...`, 'info');
  
  try {
    const response = await fetch('http://localhost:9000/api/cloud-agents/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: taskType,
        input: {}
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showNotification(`Task completed successfully`, 'success');
    }
  } catch (error) {
    showNotification(`Task failed: ${error.message}`, 'error');
  }
}

function addTaskToHistory(task) {
  const taskList = document.getElementById('taskList');
  if (!taskList) return;
  
  const taskItem = document.createElement('div');
  taskItem.className = 'task-item';
  taskItem.id = `task-${task.id}`;
  taskItem.innerHTML = `
    <div class="task-item-header">
      <strong>${task.type}</strong>
      <span class="task-status ${task.status}">${task.status}</span>
    </div>
    <div class="task-result" id="result-${task.id}">
      <em>Processing...</em>
    </div>
  `;
  taskList.prepend(taskItem);
}

function updateTaskInHistory(task) {
  const resultDiv = document.getElementById(`result-${task.id}`);
  if (resultDiv) {
    resultDiv.innerHTML = task.result ? 
      `<pre>${JSON.stringify(task.result, null, 2)}</pre>` : 
      `<em>${task.error}</em>`;
  }
  
  const taskItem = document.getElementById(`task-${task.id}`);
  if (taskItem) {
    const statusSpan = taskItem.querySelector('.task-status');
    statusSpan.className = `task-status ${task.status}`;
    statusSpan.textContent = task.status;
  }
}

function loadCloudAgentsData() {
  // Load from backend in production
}

/**
 * Network Map
 */
function loadNetworkMap() {
  const container = document.getElementById('networkGraph');
  if (!container) return;
  
  // Sample network data
  const nodes = new vis.DataSet([
    { id: 1, label: 'Node 1\n(This Node)', color: '#00a8ff' },
    { id: 2, label: 'Peer 2', color: '#2ecc71' },
    { id: 3, label: 'Peer 3', color: '#2ecc71' },
    { id: 4, label: 'Peer 4', color: '#2ecc71' }
  ]);
  
  const edges = new vis.DataSet([
    { from: 1, to: 2, label: '15ms' },
    { from: 1, to: 3, label: '22ms' },
    { from: 2, to: 4, label: '18ms' }
  ]);
  
  const data = { nodes, edges };
  const options = {
    nodes: {
      shape: 'dot',
      size: 20,
      font: { size: 12, color: '#ffffff' }
    },
    edges: {
      width: 2,
      color: { color: '#555555' },
      font: { size: 10, color: '#a0a0a0' }
    },
    physics: {
      enabled: true,
      stabilization: { iterations: 200 }
    }
  };
  
  new vis.Network(container, data, options);
}

/**
 * Logs
 */
function viewLogs(component) {
  navigateToPage('logs');
  document.getElementById('logComponent').value = component;
  loadLogs(component);
}

async function loadLogs(component) {
  const container = document.getElementById('logsContainer');
  if (!container) return;
  
  try {
    const url = component ? 
      `http://localhost:9000/api/logs/${component}` :
      'http://localhost:9000/api/logs/all';
    
    const response = await fetch(url);
    const data = await response.json();
    
    container.innerHTML = '';
    data.logs.forEach(log => {
      addLogEntry(component || 'all', log);
    });
  } catch (error) {
    console.error('Failed to load logs:', error);
  }
}

function addLogEntry(component, log) {
  const container = document.getElementById('logsContainer');
  if (!container) return;
  
  const entry = document.createElement('div');
  entry.className = `log-entry ${log.type}`;
  entry.textContent = `[${log.time}] [${component}] ${log.message}`;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

function clearLogs() {
  const container = document.getElementById('logsContainer');
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Utilities
 */
function updateConnectionStatus(connected) {
  const dot = document.getElementById('connectionStatus');
  const text = document.getElementById('connectionText');
  
  if (connected) {
    dot.style.background = '#2ecc71';
    text.textContent = 'Connected';
  } else {
    dot.style.background = '#e74c3c';
    text.textContent = 'Disconnected';
  }
}

function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  // In production, use a proper notification library
}
