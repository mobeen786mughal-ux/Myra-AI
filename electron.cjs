const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let backendProcess;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    title: "MYRA AI",
    icon: path.join(__dirname, 'public/assets/App_icon.jpg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, 'dist/index.html')}`;
  mainWindow.loadURL(startUrl);
  
  // Close Button (X) dabane par app background mein jaye, band na ho
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide(); // Sirf hide karo
    }
    return false;
  });
}

app.whenReady().then(() => {
  // 1. Start Backend
  backendProcess = fork(path.join(__dirname, 'server.js'));

  // 2. Create Window
  createWindow();

  // 3. Create System Tray
  try {
    tray = new Tray(path.join(__dirname, 'public/assets/App_icon.jpg')); // Icon path
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show MYRA', click: () => mainWindow.show() },
      { label: 'Quit MYRA', click: () => { app.isQuitting = true; app.quit(); } }
    ]);
    tray.setToolTip('MYRA AI Assistant');
    tray.setContextMenu(contextMenu);
  } catch (e) {
    console.log("Tray icon error: Make sure App_icon.jpg is in public/assets/");
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Window Controls IPC
ipcMain.on('window-control', (event, action) => {
  if (!mainWindow) return;
  if (action === 'minimize') mainWindow.minimize();
  if (action === 'maximize') {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
  if (action === 'close') {
    mainWindow.close(); // Yeh upar wale logic se hide ho jayega
  }
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
