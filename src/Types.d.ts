

// im not entirely sure if i should be doing this or not..
// but this is where im choosing to keep types only because i 
// can include them in the tsconfig and not have to export/import types


type WindowConfig = {
  location: string
  widthPercentage: number
  heightPercentage: number
  staticEditorPercentage: number
}

// type EditorConfig = {
//   staticEditor: number
// }

type ActiveWinInfo = {
  monitor: string,
  platform: string,
  title: string,
  app: string,
  appPath: string,
  windowID: number,
  processID: number,
  icon: string
  bounds: Electron.Rectangle,
}

type MessageRequest = {
  request: string,
  data?: string
}

type MonitorConfig = {
  index: number
  id: number
  bounds: Electron.Rectangle
  isDisabled: boolean
  windowConfig?: WindowConfig
}

const startUpData = 'startUpData'


// type KontextConfig = {
//   [key: string]: any
//   directory: string
//   path: string
//   contextPaths: string[]
//   defaultWindowConfig: WindowConfig
//   monitors: { [id: string]: MonitorConfig } = {};
//   resetConfig: boolean
// }


// if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
//   import refocus from '../../scripts/refocus'
// }



