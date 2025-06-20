import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const { app, BrowserWindow, ipcMain, shell } = require2("electron");
const { spawn } = require2("child_process");
const path = require2("path");
require2("http");
const isDev = !!process.env.ELECTRON_RENDERER_URL;
function createWindow() {
  console.log("Dir root: ", __dirname);
  console.log("Dev Mode:", isDev);
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "../../resources/icon.png")
  });
  win.once("ready-to-show", () => win.show());
  if (isDev) {
    console.log("Loading app from: ", process.env.ELECTRON_RENDERER_URL);
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    console.log("Loading app from: ", path.join(__dirname, "../renderer/index.html"));
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}
app.whenReady().then(async () => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("before-quit", () => {
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
