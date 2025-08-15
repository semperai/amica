import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

// This is a temporary solution to get the native module path.
// In a real application, this would be handled by the build process.
const nativeModulePath = path.join(__dirname, `../rust-lib/amica-rust-lib.node`);
const { proxy_request_blocking, proxy_request_streaming, start_sidecar, stop_sidecar } = require(nativeModulePath);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = process.env.ELECTRON_START_URL || path.join(__dirname, '../out/index.html');

  if (process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(startUrl);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(startUrl);
  }

  ipcMain.handle('proxy_request_blocking', async (event, payload) => {
    return await proxy_request_blocking(payload);
  });

  ipcMain.on('proxy_request_streaming', async (event, payload) => {
    const onChunk = (chunk) => {
      mainWindow.webContents.send('stream-chunk', chunk);
    };
    const onEnd = () => {
      mainWindow.webContents.send('stream-end');
    };
    const onError = (error) => {
      mainWindow.webContents.send('stream-error', error);
    };
    await proxy_request_streaming(payload, onChunk, onEnd, onError);
  });

  ipcMain.handle('start_sidecar', async (event, payload) => {
    const onOutput = (output) => {
      mainWindow.webContents.send('sidecar-output', output);
    };
    return await start_sidecar(payload, onOutput);
  });

  ipcMain.handle('stop_sidecar', async () => {
    return await stop_sidecar();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
