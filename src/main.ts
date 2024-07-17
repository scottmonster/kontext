import { app, BrowserWindow, ipcMain } from "electron";
import os from "os";
import path from "path";
// import KontextConfig from "./app/KontextConfig";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Kontext } from "./app/Kontext";
import { KontextConfig } from "./app/KontextConfig";

import { screen } from "electron";
import { Result } from "get-windows";

import fs from "fs";

import { ActiveWindow, WindowInfo } from "@paymoapp/active-window";
ActiveWindow.initialize();
if (!ActiveWindow.requestPermissions()) {
  console.log(
    "Error: You need to grant screen recording permission in System Preferences > Security & Privacy > Privacy > Screen Recording"
  );
  process.exit(0);
}

let getActiveWinStats: Function;
import("get-windows").then((getWin) => {
  getActiveWinStats = getWin.activeWindowSync;
});




ipcMain.on("fromRender", (event, data) => {
  // console.log('Received', data, 'from Renderer');
  // event.reply('fromMain', 'Hello from Main');
  // console.log(event);
  // console.log(event.sender.id);
  // const mon = kontext.getMonitorFromWindowID(event.sender.id);

  // const req: MessageRequest = JSON.parse(data);

  kontext.onFromRender(event.sender.id, data, event.reply);

  // event.reply("fromMain", mon);
});

function generateVarCss(data: string) {
  if (!MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    return;
  }

  const json = JSON.parse(data);

  let css = ":root {\n";

  for (let selector in json) {
    css += `${selector}: ${json[selector]};\n`;
  }

  css += "}";

  let varFile = path.join(__dirname, `../../avaialableCssVars.css`);

  // console.log(varFile);

  fs.writeFileSync(varFile, css);

  return css;
}

ipcMain.on("cssVars", (event, data) => {
  console.log(data);
  generateVarCss(data);

});

async function handleWinChange(activeWinEvent: WindowInfo) {
  if (!getActiveWinStats) {
    return;
  }

  if (activeWinEvent === null) {
    console.log("No active window");
    return;
  }

  // const winStats: Result = await getActiveWinStats();

  let winStats = {
    platform: "unknown",
    title: "unknown",
    id: 0,
    owner: { name: "unknown", processId: 0, path: "unknown" },
    bounds: { x: 0, y: 0, width: 0, height: 0 },
    memoryUsage: 0,
  };

  winStats = await getActiveWinStats();

  const winInfo: ActiveWinInfo = {
    monitor: screen.getDisplayMatching(winStats.bounds).id.toString(),
    platform: winStats.platform,
    title: activeWinEvent.title,
    app: activeWinEvent.application,
    appPath: winStats.owner.path,
    windowID: winStats.id,
    processID: activeWinEvent.pid,
    icon: activeWinEvent.icon,
    bounds: winStats.bounds,
  };

  // console.log(winInfo);
  kontext.onWindowChange(winInfo);
}

// subscribe to window change events
let watchId = ActiveWindow.subscribe(handleWinChange);

function cleanup() {
  console.log("Cleaning up resources...");
  ActiveWindow.unsubscribe(watchId);
  process.exit();
}

// Handle exit
process.on("exit", (code) => {
  console.log(`Node process exit with code: ${code}`);
  // Note: Only synchronous operations can be safely performed here
  cleanup();
});

// Handle SIGINT (e.g., Ctrl+C)
process.on("SIGINT", () => {
  console.log("Received SIGINT. Performing cleanup...");
  cleanup();
});

// Handle SIGTERM (e.g., kill command)
process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Shutting down gracefully...");
  cleanup();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Log and continue, you might want to handle it differently
  cleanup();
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  cleanup(); // Optionally perform cleanup and then shut down
});

/**
 * okay so... I haven't slept in over 36 hours... but it is too early to go to sleep today.
 * Instead, i will try to raw dog some code and probably come up with something I will
 * regret later. lfg.
 *
 * TODO: lets stuff ALL of the config logic into the KontextConfig class. Before we instansciate the KontextConfig class we will parse the command line args so we can do different things. For now we will only allow one command line arg of --directory so the directory can be set. All other options will be set in the config file.
 *  - parsing the command line args should be the first thing we do before we even try to start electron
 *
 */

// okay lets break the default electron project. we will use main.ts as the entry and then yea yea yea
// ....so we actually should wait for electron so we can use screen to get the monitor info... so lets unbreak the default electron project and then we can init on ready

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);
app.on("ready", init);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {
    // createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

let config: KontextConfig;
let kontext: Kontext;

function init() {
  console.log("init ran");


  // const projectDirectory = path.join(__dirname, "../../");

  // const parentDirectory = path.dirname(__dirname);
  // const t = path.basename(projectDirectory)
  // console.log(projectDirectory);
  // console.log(t);


  // process.exit(0);

  /**
   * this entire thing is pretty horrible... this config and that config and a config over here...
   * configs sould probably just defined as a type, parsed once when creating the Kontext object
   * roll with it and get it going.... learn and refactor later
   *
   */
  config = configFromArgs();

  
  kontext = new Kontext(config);
}

function getConfig(): KontextConfig {
  const args: Partial<KontextConfig> = yargs(hideBin(process.argv)).options({
    directory: { type: "string" },
    resetConfig: { type: "boolean" },
  }).argv;

  return args as KontextConfig;
}

function configFromArgs() : KontextConfig{
  const args: Partial<KontextConfig> = yargs(hideBin(process.argv)).options({
    directory: { type: "string" },
    resetConfig: { type: "boolean" },
  }).argv;

  // here we could catch it do something else... maybe add a help command or some shiii
  if (args.dohelp) {
    console.log(args.dohelp);
  }


  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    args.directory = path.join(__dirname, "../../kontext_dir");
  }

  let kindaNotReallyValidatedPath = undefined;
  if (args.directory) {
    // should probably do some path validation here
    try {
      const normalizedPath = path.normalize(args.directory);
      const resolvedPath = path.resolve(args.directory);
      const absolutePath = path.isAbsolute(resolvedPath);
      kindaNotReallyValidatedPath = resolvedPath;
    } catch (error) {
      // return false;
      console.warn(`Unable to resolve directory path: ${args.directory}`);
    }
  }

  args.directory = kindaNotReallyValidatedPath;


  // console.log(args.directory);

  // process.exit(0);

  return new KontextConfig(args);
}
