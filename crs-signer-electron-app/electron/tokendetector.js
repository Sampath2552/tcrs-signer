// const { JavaCaller } = require("java-caller");

const {exec} = require("child_process")
const { resolve } = require("path")
let tokencaller = ()=>{
    return new Promise((resolve,reject)=>{
        exec('java -cp ./electron/Tcrs.jar com.tcs.sign.TokenDetector',(error,stdout,stderr)=>{
            if(error) {
                reject(`Error: ${error.message}`)
                return
            }
            if(stderr)
            {
                reject(`stderr: ${stderr}`)
                console.log(stderr)
                return
            }
            resolve({status:"0",stdout:stdout,stderr:stderr})
        })
    })
}
// let tokencaller = ()=>{
//    let programDetails=  {status:"",stdout:"",stderr:""}
//   exec('java -cp ElectronSign.jar com.tcs.sign.TokenDetector',
// function (error, stdout, stderr){
//     console.log(stdout)
   
//     programDetails.stdout=stdout
//     programDetails.stderr=stderr
// });
//     console.log("Inside tokencaller="+programDetails)
//     return programDetails
// }
// let tokencaller = async()=>{
// const java = new JavaCaller({
//     classPath: 'ElectronSign.jar',
//     mainClass: 'com.tcs.sign.TokenDetector'
// });
// const { status, stdout, stderr } = await java.run();
//  return {status,stdout,stderr}
// }
module.exports = tokencaller