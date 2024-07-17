// import exec from 'child_process';

const exec = require('child_process').exec;
const path = require('path');


const refocusProjectDirectory = path.join(__dirname, "../../");
const refocusDirName = path.basename(refocusProjectDirectory)
const refocusCommand = 'wmctrl -i -a $(wmctrl -l | grep "' + refocusDirName + ' - V" | awk "{print $1}")'
console.log(`refocus: ${refocusDirName}`);
async function refocus() {
  exec(refocusCommand)
}

// export default refocus;