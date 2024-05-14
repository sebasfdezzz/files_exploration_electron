const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600
    })

    win.loadFile('./template/index.html')
}

app.on('ready', () => {
  createWindow();
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

ipcMain.on('navigate', (event, page) => {
  mainWindow.loadFile(path.join(__dirname, 'templates', page));
});