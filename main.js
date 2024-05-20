const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const {createFileWithContent} = require('./utils/commands.js')

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'template', 'index.html'));
    //mainWindow.webContents.openDevTools(); // Open DevTools

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

app.on('ready', createWindow);

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
    if (mainWindow) {
        mainWindow.loadFile(path.join(__dirname, 'template', page)).catch(err => {
            console.error('Failed to load page:', err);
        });
    }
});

ipcMain.on('log', (event, message) => {
  console.log(message);
});
