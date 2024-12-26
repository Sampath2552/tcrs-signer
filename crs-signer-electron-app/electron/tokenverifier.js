

const {exec} = require("child_process")
const { resolve } = require("path")
let tokenverifier = (password)=>{
    return new Promise((resolve,reject)=>{
        exec(`java -cp ./resources/app/electron/Tcrs.jar com.tcs.sign.TokenVerifier "${password}"`,(error,stdout,stderr)=>{
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
            stdout = stdout.replace("\r\n","")
            resolve({status:"0",stdout:stdout,stderr:stderr})
        })
    })
}

module.exports = tokenverifier