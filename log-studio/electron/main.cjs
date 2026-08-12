const { app, BrowserWindow, Menu, dialog, shell } = require("electron");
const { spawn } = require("node:child_process");
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const net = require("node:net");
const path = require("node:path");

let mainWindow = null;
let serverProcess = null;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

app.on("second-instance", () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
});

function configPath() {
  return path.join(app.getPath("userData"), "desktop-config.json");
}

function readConfiguredRoot() {
  try {
    const parsed = JSON.parse(readFileSync(configPath(), "utf8"));
    return typeof parsed.logsRoot === "string" && existsSync(parsed.logsRoot) ? parsed.logsRoot : null;
  } catch {
    return null;
  }
}

function saveConfiguredRoot(logsRoot) {
  mkdirSync(path.dirname(configPath()), { recursive: true });
  writeFileSync(configPath(), JSON.stringify({ logsRoot }, null, 2), "utf8");
}

async function resolveLogsRoot() {
  const configured = readConfiguredRoot();
  if (configured) return configured;

  const candidates = [
    process.env.DYSTATE_LOGS_ROOT,
    "E:\\Astro\\src\\data\\logs",
    path.join(app.getPath("documents"), "Dystate", "logs"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      saveConfiguredRoot(candidate);
      return candidate;
    }
  }

  const selected = await dialog.showOpenDialog({
    title: "选择 Dystate 日志目录",
    message: "请选择包含 Markdown / MDX 日志的目录",
    properties: ["openDirectory", "createDirectory"],
  });
  if (!selected.canceled && selected.filePaths[0]) {
    saveConfiguredRoot(selected.filePaths[0]);
    return selected.filePaths[0];
  }

  const fallback = path.join(app.getPath("documents"), "Dystate", "logs");
  mkdirSync(fallback, { recursive: true });
  saveConfiguredRoot(fallback);
  return fallback;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

function serverEntryPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "app-server", "server", "entry.mjs")
    : path.join(__dirname, "..", "dist-desktop", "server", "entry.mjs");
}

async function waitForServer(url) {
  let lastError;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw lastError || new Error("桌面服务启动超时");
}

function startServer(port, logsRoot) {
  const entry = serverEntryPath();
  if (!existsSync(entry)) throw new Error(`找不到桌面服务：${entry}`);

  serverProcess = spawn(process.execPath, [entry], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      HOST: "127.0.0.1",
      PORT: String(port),
      DESKTOP_MODE: "true",
      LOG_CONTENT_PROVIDER: "local",
      LOGS_LOCAL_ROOT: logsRoot,
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  serverProcess.stdout?.on("data", (chunk) => console.log(`[Log Studio] ${chunk}`));
  serverProcess.stderr?.on("data", (chunk) => console.error(`[Log Studio] ${chunk}`));
  serverProcess.on("exit", (code) => {
    if (code && !app.isQuitting) console.error(`Log Studio server exited with code ${code}`);
  });
}

function stopServer() {
  if (!serverProcess || serverProcess.killed) return;
  serverProcess.kill();
  serverProcess = null;
}

async function createWindow() {
  const logsRoot = await resolveLogsRoot();
  const port = await freePort();
  const url = `http://127.0.0.1:${port}/`;
  startServer(port, logsRoot);
  await waitForServer(url);

  mainWindow = new BrowserWindow({
    title: "Dystate Log Studio",
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 680,
    show: false,
    backgroundColor: "#f7f7f5",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    if (/^https?:/i.test(target)) shell.openExternal(target);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, target) => {
    if (new URL(target).origin !== new URL(url).origin) {
      event.preventDefault();
      if (/^https?:/i.test(target)) shell.openExternal(target);
    }
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("closed", () => { mainWindow = null; });
  await mainWindow.loadURL(url);
}

Menu.setApplicationMenu(null);
app.on("before-quit", () => {
  app.isQuitting = true;
  stopServer();
});
app.on("window-all-closed", () => app.quit());
app.whenReady().then(createWindow).catch((error) => {
  dialog.showErrorBox("Log Studio 无法启动", error instanceof Error ? error.message : String(error));
  app.quit();
});
