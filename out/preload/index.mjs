import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const { contextBridge, ipcRenderer } = require2("electron");
dge.exposeInMainWorld("api", {
  getVersion: () => ipcRenderer.invoke("app:getVersion"),
  send: (channel, data) => ipcRenderer.send(channel, data),
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  receive: (channel, fn) => {
    const subscription = (_event, ...args) => fn(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  }
});
