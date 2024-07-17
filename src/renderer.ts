/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

// mix-blend-mode: difference;


import "normalize.css";

import Editor from "./render/ts/Editor";
import { reactivemd } from "./render/md/reactivemd";
import { staticmd } from "./render/md/staticmd";
import { smallmd } from "./render/md/smallmd";

// import { MessageRequest } from "./old_app/Kontext";

let reactiveEditor: Editor;
let staticEditor: Editor;

let darkModeEnabled = true;

// to create an editor, we need an editor name which should match the id of the element

let editors: { [id: string]: Editor } = {};

async function createEditor(id: string, heightPercentage = 0) {

  const editorParent = document.getElementById('notEditableContainer');

  // const editorContainer = document.createElement('div');
  // editorContainer.id = `${id}Container`;
  // editorContainer.classList.add('editor');

  const editorContainer = Object.assign(
    document.createElement('div'), 
    { id: `${id}Container`, 
    className: 'editor' });

  const editorElement = Object.assign(document.createElement('div'), { id: id });

  editorContainer.appendChild(editorElement);

  editorParent.appendChild(editorContainer);

  // document.getElementById(id))

  editors[id] = await Editor.create(editorElement);

  const topPanel = editorParent.getElementsByClassName('ck-editor__top')[0]
  // console.log(topPanel.clientHeight);
  const topPanelHeight = topPanel.getClientRects()[0].height;
  console.log(topPanel.clientHeight);
  console.log(topPanel.getClientRects()[0].height);
  console.log(window.innerHeight);
  console.log(document.body.getClientRects()[0].height)
  
  if (heightPercentage !== 0){
    console.log('its not zero');
    // editorContainer.style.height = `${heightPercentage}%`
    // editorContainer.style.maxHeight = `${heightPercentage}%`
  } else {
    console.log('it is zero');
  }

  if (id === 'static'){
    editors[id].setMD(staticmd);
    // editors[id].setMD(smallmd);
  } else {
    editors[id].setMD(reactivemd);
    // editors[id].setMD(smallmd);
  }

}

function ghettoDarkMode() {
  var css = `
    :root {
      --orange: rgb(197, 134, 25);
      --ck-color-base-active: var(--orange);
      --ck-color-base-active-focus: var(--orange);
      --ck-color-button-on-color: var(--orange);
      --ck-color-widget-type-around-button-active: var(--orange);
      --ck-color-focus-border: var(--orange);
      --ck-color-button-on-color: rgb(214, 136, 0);
      --ck-color-upload-bar-background: rgb(147, 74, 6);
      --almostTransparentOrange: rgba(255, 136, 0, 0.103);
      --ck-color-selector-focused-cell-background: var(--almostTransparentOrange);
      --ck-color-button-on-background: var(--almostTransparentOrange);
      --ck-color-button-on-hover-background: var(--almostTransparentOrange);
      --ck-color-button-on-active-background: var(--almostTransparentOrange);
      --ck-color-color-grid-check-icon: rgb(233, 144, 43);
      --ck-color-base-focus: rgb(147, 74, 6);
      --ck-color-focus-outer-shadow: rgba(53, 30, 3, 0.3);
      --ck-table-selected-cell-background: rgba(97, 48, 5, 0.3);
      --ck-color-focus-disabled-shadow: rgba(136, 69, 7, 0.3);
    }

    body::after {
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 10000;
      background-color: hsl(0, 0%, 90%);
      mix-blend-mode: exclusion;
      pointer-events: none;
    }

    * {
      z-index: inherit;
    }

    .image-inline, img, span:has(img),
    a, video, audio, iframe, canvas, svg, embed, object, applet {
      position: relative;
      z-index: 10001 !important;
    }
  `;

  if (darkModeEnabled) {

    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

}



async function init() {
  // console.log('init');
  // reactiveEditor = await Editor.create(document.getElementById('reactive'));
  // staticEditor = await Editor.create(document.getElementById('static'));
  // console.log(reactiveEditor.doWerk());
  // console.log(staticEditor.doWerk());
  // reactiveEditor.setMD(reactivemd);
  // staticEditor.setMD(staticmd);

  // window.api.send('cssVars', JSON.stringify(getCssVars()));

  // const message = {
  //   request: startUpData,
  //   data: '',
  // };

  // window.api.send('toMain', 'renderer ready');
  // sendMessage(message);

  createEditor('reactive');
  createEditor('static', 25);

  displayElement('ktNavContainer', 'flex');


  

  const req: MessageRequest = {
    request: "log",
    data: "Hello from Renderer",
  };

  sendMessage(req);


  ghettoDarkMode()
}

async function displayElement(id : string, display: string){
  const element = document.getElementById(id);
  element.style.display = display;
}

async function sendMessage(message: MessageRequest) {
  window.api.send("fromRender", JSON.stringify(message));
}

import { getCssVars } from "./render/getCssVariables";

document.addEventListener("DOMContentLoaded", init);

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite'
);

declare global {
  interface Window {
    api: {
      send: (channel: string, data: any) => void;
      receive: (channel: string, func: (event: any, data: any) => void) => void;
    };
  }
}

function processMessage(data: any) {
  console.log("Processing message", data);
}

window.api.receive("fromMain", (data) => {
  const msg = JSON.parse(data);
});

// setInterval(() => {
//   console.log('Sending message to main');
//   window.api.send('toMain', 'Hello from Renderer');
// }, 5000);

// import './render/multiclassic.css';
import "./render/index.scss";
// import './render/cke_override.scss';

// import './render/darkmode.js'
