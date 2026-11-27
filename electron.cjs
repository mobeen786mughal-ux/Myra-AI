const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "MYRA AI",
    autoHideMenuBar: true, // Top menu bar chupane ke liye
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Production mode mein built files load karega, dev mode mein localhost
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  win.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
