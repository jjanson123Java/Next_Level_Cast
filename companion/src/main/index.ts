import { app, BrowserWindow, dialog, ipcMain, safeStorage } from "electron";
import { openAsBlob } from "node:fs";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { CompanionApplication } from "./application";
import { CompanionController } from "./companion-controller";
import { AssetReadinessService } from "./asset-readiness";
import { CredentialStore } from "./credential-store";
import { createOBSClient } from "./obs-client";
import { OBSLauncher } from "./obs-launcher";
import { MediaUploadJob } from "./media-upload-job";
import { probeMedia } from "./media-probe";
import { generatePreview } from "./preview-generator";
import { WindowsDeviceProbe } from "./windows-device-probe";
import { allowedRendererNavigation, parseCompanionLaunch, parseUploadLaunch, resolveCloseAction, type UploadLaunch } from "./protocol";
import type { ApprovedScene } from "../shared/contracts";
import { upload } from "@vercel/blob/client";

let mainWindow: BrowserWindow | null = null;
let service: CompanionApplication;
let allowClose = false;
const parseRuntimeUploadLaunch = (value: string) => parseUploadLaunch(value, { allowLocalDevelopment: !app.isPackaged });
let pendingUploadLaunch: UploadLaunch | null = process.argv.map(parseRuntimeUploadLaunch).find(Boolean) ?? null;

function broadcastStatus() {
  mainWindow?.webContents.send("companion:status", service.status());
}

function installUploadJob(launch: UploadLaunch) {
  const job = new MediaUploadJob(launch, {
    selectFile: async () => {
      if (!mainWindow) return null;
      const result = await dialog.showOpenDialog(mainWindow, { title: "Choose the completed Next Level Cast episode", properties: ["openFile"], filters: [{ name: "Podcast media", extensions: ["mp4", "webm", "mp3", "m4a", "wav"] }] });
      return result.canceled ? null : result.filePaths[0] ?? null;
    },
    makeTempDirectory: () => mkdtemp(join(tmpdir(), "nextlevelcast-preview-")),
    probe: (sourcePath) => probeMedia(sourcePath),
    generate: (input) => generatePreview(input),
    upload: async ({ origin, episodeId, secret, role, attemptId, sourcePath, originalFilename, signal, onProgress }) => {
      const safeName = originalFilename.replace(/[^A-Za-z0-9._-]/g, "-");
      const body = await openAsBlob(sourcePath);
      await upload(`episodes/${episodeId}/${role}-${safeName}`, body, {
        access: "private",
        handleUploadUrl: `${origin}/api/admin/podcasts/upload`,
        headers: { authorization: `Bearer ${secret}` },
        clientPayload: JSON.stringify({ episodeId, role, originalFilename, attemptId }),
        multipart: body.size > 50_000_000,
        abortSignal: signal,
        onUploadProgress: ({ percentage }) => onProgress(Math.round(percentage)),
      });
    },
    cleanup: (path) => rm(path, { recursive: true, force: true }),
  }, broadcastStatus);
  service.setMediaUploadJob(job);
  broadcastStatus();
}

function registerHandlers() {
  ipcMain.handle("companion:get-status", () => service.status());
  ipcMain.handle("companion:sync-status", () => service.syncStatus());
  ipcMain.handle("companion:get-program-preview", () => service.getProgramPreview());
  ipcMain.handle("companion:refresh", async () => {
    try { return await service.refresh(); } finally { broadcastStatus(); }
  });
  ipcMain.handle("companion:connect", async (_event, password: string) => {
    try { return await service.connect(password); } finally { broadcastStatus(); }
  });
  ipcMain.handle("companion:launch-obs", () => service.launchOBS());
  ipcMain.handle("companion:disconnect-obs", async () => {
    const result = await service.disconnectOBS(); broadcastStatus(); return result;
  });
  ipcMain.handle("companion:close-obs", async () => {
    try { return await service.closeOBS(true); } finally { broadcastStatus(); }
  });
  ipcMain.handle("companion:set-scene", async (_event, scene: ApprovedScene) => {
    const result = await service.setScene(scene); broadcastStatus(); return result;
  });
  ipcMain.handle("companion:start-recording", async () => {
    const result = await service.startRecording(); broadcastStatus(); return result;
  });
  ipcMain.handle("companion:stop-recording", async () => {
    const result = await service.stopRecording(true); broadcastStatus(); return result;
  });
  ipcMain.handle("companion:set-full-screen", (_event, enabled: boolean) => mainWindow?.setFullScreen(enabled));
  ipcMain.handle("companion:start-media-upload", async () => { try { return await service.startMediaUpload(); } finally { broadcastStatus(); } });
  ipcMain.handle("companion:retry-media-upload", async () => { try { return await service.retryMediaUpload(); } finally { broadcastStatus(); } });
  ipcMain.handle("companion:cancel-media-upload", async () => { try { return await service.cancelMediaUpload(); } finally { broadcastStatus(); } });
  ipcMain.handle("companion:request-close", async (_event, choice: "cancel" | "leave-recording" | "stop-recording") => {
    const action = resolveCloseAction({ recording: Boolean(service.status().recording), choice });
    if (action === "cancel") return { closed: false };
    if (action === "stop-and-close") await service.stopRecording(true);
    allowClose = true;
    mainWindow?.close();
    return { closed: true };
  });
}

function createWindow() {
  const rendererPath = join(__dirname, "../renderer/index.html");
  const rendererUrl = pathToFileURL(rendererPath).toString();
  const window = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1024, minHeight: 700,
    backgroundColor: "#063c45", title: "Next Level Cast Companion",
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"), contextIsolation: true,
      sandbox: true, nodeIntegration: false,
    },
  });
  window.webContents.on("will-navigate", (event, target) => {
    if (!allowedRendererNavigation(target, rendererUrl)) event.preventDefault();
  });
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("before-input-event", (event, input) => {
    if (input.key === "Escape" && window.isFullScreen()) {
      event.preventDefault();
      window.setFullScreen(false);
    }
  });
  void window.loadFile(rendererPath);
  window.on("close", (event) => {
    if (allowClose || !service?.status().recording) return;
    event.preventDefault();
    void dialog.showMessageBox(window, {
      type: "warning",
      title: "OBS is recording",
      message: "OBS is still recording. What would you like to do?",
      buttons: ["Cancel", "Leave OBS Recording", "Stop Recording and Close"],
      defaultId: 0,
      cancelId: 0,
      noLink: true,
    }).then(async ({ response }) => {
      if (response === 0) return;
      if (response === 2) await service.stopRecording(true);
      allowClose = true;
      window.close();
    });
  });
  window.on("closed", () => { if (mainWindow === window) mainWindow = null; });
  return window;
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.setAsDefaultProtocolClient("nextlevelcast");
  app.on("second-instance", (_event, argv) => {
    const uploadLaunch = argv.map(parseRuntimeUploadLaunch).find(Boolean);
    if (!uploadLaunch && !argv.some((value) => parseCompanionLaunch(value) === "recording")) return;
    if (!mainWindow) mainWindow = createWindow();
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    if (uploadLaunch && service) installUploadJob(uploadLaunch);
  });
  void app.whenReady().then(() => {
    const protocolArguments = process.argv.filter((value) => value.toLowerCase().startsWith("nextlevelcast:"));
    if (protocolArguments.length && !protocolArguments.some((value) => parseCompanionLaunch(value) === "recording" || parseRuntimeUploadLaunch(value))) {
      app.quit();
      return;
    }
    const client = createOBSClient();
    const assetReadiness = new AssetReadinessService();
    const executeFile = promisify(execFile);
    const windowsDevices = new WindowsDeviceProbe(async () => {
      const { stdout } = await executeFile("powershell.exe", [
        "-NoProfile", "-NonInteractive", "-Command",
        "Get-PnpDevice -PresentOnly | Where-Object { $_.Class -in @('AudioEndpoint','Camera','Image','Monitor') } | Select-Object Class,FriendlyName,InstanceId | ConvertTo-Json -Compress",
      ], { windowsHide: true, timeout: 10000 });
      return stdout;
    });
    const assetChecks = [
      ["next-level-cast-cover.png", "Next Level Cast cover", "a4877623edaafa3b46804edea2a924fcd253f1d454d5adb3f09125d3b5441302"],
      ["level-completed-welcome.mp3", "Level Completed welcome audio", "4c0e318ee9e0c2ca5d84f7728533d0742a40a5c1b5868eb5767ad396b3eabeff"],
    ] as const;
    const controller = new CompanionController(client, setTimeout, async () => {
      const [deviceChecks, mediaChecks] = await Promise.all([
        windowsDevices.readiness(),
        Promise.all(assetChecks.map(async ([file, label, hash]) => {
          const result = await assetReadiness.verify(join(__dirname, "../renderer/assets", file), hash);
          return { id: `asset:${file}`, label, ...result };
        })),
      ]);
      return [...deviceChecks, ...mediaChecks];
    });
    const credentials = new CredentialStore(join(app.getPath("userData"), "obs-credential.json"), {
      isEncryptionAvailable: () => safeStorage.isEncryptionAvailable(),
      encryptString: (value) => safeStorage.encryptString(value),
      decryptString: (value) => safeStorage.decryptString(value),
    });
    const launcher = new OBSLauncher({
      exists: async (path) => { try { await access(path); return true; } catch { return false; } },
      spawn: (executable, arguments_, options) => spawn(executable, arguments_, { cwd: options.cwd, windowsHide: options.windowsHide, detached: false }),
    });
    service = new CompanionApplication(controller, credentials, launcher);
    if (pendingUploadLaunch) { installUploadJob(pendingUploadLaunch); pendingUploadLaunch = null; }
    client.subscribe("RecordStateChanged", (event: { outputActive?: boolean }) => {
      service.recordingEvent(Boolean(event.outputActive), event.outputActive ? new Date().toISOString() : undefined);
      broadcastStatus();
    });
    client.subscribe("CurrentProgramSceneChanged", () => void service.refresh().then(broadcastStatus));
    client.subscribe("ConnectionClosed", () => { service.disconnected(); broadcastStatus(); });
    registerHandlers();
    mainWindow = createWindow();
    void service.connectSaved().then(broadcastStatus).catch(broadcastStatus);
  });
}
