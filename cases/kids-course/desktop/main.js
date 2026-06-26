// 单机桌面 App（Electron）入口 —— 把网页课程打包成 Windows/Mac 单机程序。
// 用法：本目录 `npm i` 后 `npm start` 即可窗口运行；`npm run dist` 用 electron-builder 出安装包。
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1100, height: 820, minWidth: 900, minHeight: 640,
    title: "小步课堂",
    webPreferences: { contextIsolation: true },
  });
  // 加载上一级目录的网页（与浏览器版同一套代码）
  win.loadFile(path.join(__dirname, "..", "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
