

const {exec} = require("child_process")
const { resolve } = require("path")
//Local
//const url = "./electron/Tcrs.jar"
//Build
const url = "./resources/app/electron/Tcrs.jar"
let tokenverifier = (val)=>{
    return new Promise((resolve,reject)=>{
        exec(`java -cp ${url} com.tcs.sign.TokenVerifier "${val}"`,(error,stdout,stderr)=>{
            if(error) {
                reject(`Error: ${error.message}`)
                return
            }
            if(stderr)
            {
                reject(`stderr: ${stderr}`)

                return
            }
            stdout = stdout.replace("\r\n","")
            resolve({status:"0",stdout:stdout,stderr:stderr})
        })
    })
}

module.exports = tokenverifier