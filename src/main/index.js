// src/main/index.js
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const isDev = !!process.env.ELECTRON_RENDERER_URL;
let djangoProcess = null;

function waitForServer(url, timeout = 10000, interval = 500) {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, res => {
        res.destroy();
        resolve();
      });

      req.on('error', () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Server at ${url} did not start within ${timeout}ms`));
        } else {
          setTimeout(check, interval);
        }
      });
    };

    check();
  });
}

function startDjangoServer() {
  const basePath = path.join(__dirname, '../../resources/serve_linux')

  const executableName = 'serve_linux';
  const djangoExecutable = path.join(basePath, executableName);

  djangoProcess = spawn(djangoExecutable, [], {
    cwd: basePath,
    detached: true,
    stdio: 'inherit',
  });

  djangoProcess.unref();
}

function createWindow() {
  console.log("Dir root: ", __dirname)
  console.log("Dev Mode:", isDev)

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../../resources/icon.png'),
  });

  win.once('ready-to-show', () => win.show());

  if (isDev) {
    console.log("Loading app from: ", process.env.ELECTRON_RENDERER_URL)
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    console.log("Loading app from: ", path.join(__dirname, '../renderer/index.html'))
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(async () => {
  // try {
  //   startDjangoServer();
  //   await waitForServer('http://127.0.0.1:8000');
  // } catch (err) {
  //   console.error("Django server did not start:", err.message);
  // }

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


app.on('before-quit', () => {
  if (djangoProcess) {
    try {
      process.kill(-djangoProcess.pid);
    } catch (e) {
      console.warn('Failed to kill Django process:', e);
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});