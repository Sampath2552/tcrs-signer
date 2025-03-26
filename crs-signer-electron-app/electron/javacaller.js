const {exec} = require("child_process")
const {paths,localEnv} = require("./messages")

const url = paths.sessionPath[localEnv]



let childProcess=null
const checkProcess = ( pid)=>{

    try{process.kill(pid,0)
        return true;
    }
    catch(e)
    {
        return false
    }

}


const javacaller = () =>{

    if(childProcess)
    {
      if(checkProcess(childProcess.pid)){
          console.log("Process Active No need to restart")

      }
        else{
            startJava()
      }

    }
    else{
       startJava()
    }


}
let startJava = ()=>{
    childProcess=    exec(`java -jar ${url}`,
        function (error, stdout, stderr){

            console.log('stdout: ' + stdout +" Process Ended");
            console.log('stderr: ' + stderr + " Process Ended");

            if(error !== null){
                console.log('exec error: ' + error);
            }

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