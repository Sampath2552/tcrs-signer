const {exec} = require("child_process")
// let javacaller = ()=>{
   

// }
let childProcess=null
let javacaller = () =>{
    if(childProcess)
    {
      console.log("Process is already running")
      return
    }

      childProcess=    exec('java -jar ./electron/Tcrs.jar',
function (error, stdout, stderr){
// console.log('stdout: ' + stdout);
// console.log('stderr: ' + stderr);
// if(error !== null){
//   console.log('exec error: ' + error);
// }
  
});
console.log(`Process Started with PID:${childProcess.pid}`)
}
let stopJava = () =>{
  if(childProcess)
  {
    console.log(`Killing Process with PID:${childProcess.pid}`)
    childProcess.kill('SIGKILL')
    childProcess=null
  }
  else
  {
    console.log("No Process to Kill")
  }
}

module.exports =  {javacaller,stopJava};