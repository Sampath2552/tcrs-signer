// const { JavaCaller } = require("java-caller");

const {exec} = require("child_process")

//Local
//const url = "./electron/Tcrs.jar"
//Build
const url = "./resources/app/electron/Tcrs.jar"
let tokencaller = ()=>{
    return new Promise((resolve,reject)=>{
        exec(`java -cp ${url} com.tcs.sign.TokenDetector`,(error, stdout, stderr)=>{
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

module.exports = tokencaller