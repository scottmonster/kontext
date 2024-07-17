import { BrowserWindow, ipcMain } from 'electron'
// import ActiveWindow from '@paymoapp/active-window'
// import {activeWindow as winStats} from 'get-windows'
import yaml from 'yaml'
import path from 'path'
import fs from 'fs'

import { KontextConfig} from './KontextConfig'
import { set } from 'yaml/dist/schema/yaml-1.1/set'

// import type { MonitorConfig, WinInfo, MessageRequest } from '../Types'

// import { KontextConfig } from './KontextConfig'


//  const exec: Function = require('child_process');
const { exec } = require('child_process');
const command = `wmctrl -i -a $(wmctrl -l | grep "ef_vite_ts - V" | awk '{print $1}')`
async function refocus() {
  exec(command)
}


export class Kontext {

  config: KontextConfig
  monitors: { [id: string]: KontextMonitor } = {};
  windowMonitorMap: { [windowID: number]: string } = {};
  windows: KontextWindow[] = []
  winStats: any

  constructor(config: KontextConfig) {

    this.config = config

    // this.winStats = import('get-windows')

    // should we create a window array or a monitor array with a window property?
    for (let id of Object.keys(this.config.monitors)) {
      if (this.config.monitors[id].isDisabled) {
        continue
      }

      this.monitors[id] = new KontextMonitor(this.config.monitors[id])

      this.windowMonitorMap[this.monitors[id].window.id] = id

    }



  }

  public async onWindowChange(winInfo: ActiveWinInfo) {
    /**
     * screen.getDisplayMatching(WindowsStats.bounds)
     * that will return a display object containing monitor id
     * if this.config.monitors[id].idDisabled return
     * else kontext.monitor.updateWindow(WindowsStats)
     */
    // console.log(`window changed ${winInfo.title} : bounds : ${JSON.stringify(winInfo.bounds, null, 2)}`);

    // console.log(winInfo);

    if (!this.monitors[winInfo.monitor]) {
      // that monitor does not exist
      return
    }

    

    const window: KontextWindow = this.monitors[winInfo.monitor].window

    // we only need to update if the application has changed
    // TODO add more match modes.. title, path, etc.
    if (window.activeContext === winInfo.app) {
      console.log('no update needed');
      return
    } 

    for (let contextPath of this.config.contextPaths) {
      const markdownPath =  path.join(contextPath, `${winInfo.app}.md`)
      // if (fs.existsSync(contextPath) && fs.lstatSync(contextPath).isDirectory()) {
      //     const fileNames = fs.readdirSync(contextPath).map(file => path.join(contextPath, file));
      //     console.log(fileNames);
      // }
      if (fs.existsSync(markdownPath)){
        console.log(markdownPath);
      }
  }



  }

  public getMonitorFromWindowID(windowID: number) : KontextMonitor {
    let monitorid = this.windowMonitorMap[windowID]
    return this.monitors[monitorid]
  }


  public getWindow(windowID: number) : KontextWindow {
    let monitorid = this.windowMonitorMap[windowID]
    return this.monitors[monitorid].window
  }


  public async onFromRender(windowID: number, data: string, replyCallback: Function) {
    let req: MessageRequest 

    try {
      req = JSON.parse(data)
    } catch (error) {
      req = {
        request: undefined,
        data: data
      }
    }

    switch (req.request) {
      case undefined:
        console.log(`Recieved a message with no request from:
        windowID: ${windowID}
        data: ${req.data}`);
        break;
      case 'log':
        console.log(`Request: log -- data: ${req.data}`);
        break;
      case 'startUpData':
        this.getWindow(windowID).sendMessage(req)
        break;
      default:
        break;
    }

  }

}


class KontextWindow extends BrowserWindow{

  activeContext: string
  monitorid: string

  constructor(config: WindowConfig, position: Electron.Rectangle, monitorid: string) {
    

    const browserWindowConfig = {
      x: position.x,
      y: position.y,
      // x: 2560,
      // y: 1440,
      width: position.width,
      height: position.height,
      webPreferences: {
        // nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    }

    super(browserWindowConfig)

    this.monitorid = monitorid

    console.log(`windowID: ${this.id} -- monitorID: ${this.monitorid}`);

    this.start()

    // setInterval(() => {
    //   this.webContents.send('fromMain', 'message')
    // }, 5000

  }

  public async startUpData(){
    const data = 'startUpData'
  }


  public async sendMessage(messageRequest: MessageRequest) {
    this.webContents.send('fromMain', JSON.stringify(messageRequest, null, 2))
  }

  private async start(){
      if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      refocus()
      this.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
      refocus()
    } else {
        
        this.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    
    }

    const msg: MessageRequest = { request: 'monitorID', data: '' }



  }

  public async update(winInfo: ActiveWinInfo) {
    // we only need to update if the application has changed
    if (this.activeContext === winInfo.app) {
      return
    }



  }

}

class KontextMonitor {

  window: KontextWindow
  config: MonitorConfig

  constructor(config: MonitorConfig) {
    // console.log(`create monitor object with config: ${JSON.stringify(config, null, 2)}`);

    this.config = config

    let winPos = this.configuredWindowPosition()

    const { x, y, width, height } = this.configuredWindowPosition()
    // console.log(this.configuredWindowPosition());
    

    this.window = new KontextWindow(config.windowConfig, this.configuredWindowPosition(), this.config.id.toString())


  }

  private createBrowserWindow(){

  }

  private configuredWindowPosition(){

    // we need to generate the window position based on this.bounds and this.windowConfig
    if (this.config.windowConfig.location !== 'left') {
      // console.log(`window position feature not implemented you peasant`);
    }

    // lol
    return { x: this.config.bounds.x, y: this.config.bounds.y, width: (this.config.bounds.width * this.config.windowConfig.widthPercentage / 100), height: (this.config.bounds.width * this.config.windowConfig.heightPercentage / 100) }
  }

  /**
   * resizeActiveWindow()
   */
  public resizeActiveWindow() {
    console.log(`resize active window`);
    
  }
}





// export class refocus {

//   projectDirectory: string = path.join(__dirname, "../../");
//   refocusDirName:string = path.basename(this.projectDirectory)
//   refocusCommand = 'wmctrl -i -a $(wmctrl -l | grep "' + refocusDirName + ' - V" | awk "{print $1}")'

//   constructor() {
//     // console.log('refocus');
//   }
// }


