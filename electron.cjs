const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false, // Custom window frame (humari apni UI)
    title: "MYRA AI",
    icon: path.join(__dirname, 'public/assets/App_icon.jpg'), // Icon
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Development ya Production URL load karo
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, 'dist/index.html')}`;
  mainWindow.loadURL(startUrl);
  
  // Close button par app band karne ke liye
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (backendProcess) backendProcess.kill();
  });
}

// App ready hone par backend start karo aur window banao
app.whenReady().then(() => {
  // 1. Start Backend (server.js) in background
  backendProcess = fork(path.join(__dirname, 'server.js'));

  // 2. Create Window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Window Controls (Minimize, Maximize, Close) handle karo
ipcMain.on('window-control', (event, action) => {
  if (!mainWindow) return;
  if (action === 'minimize') mainWindow.minimize();
  if (action === 'maximize') {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
  if (action === 'close') {
    if (backendProcess) backendProcess.kill(); // Backend band karo
    mainWindow.close();
  }
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
