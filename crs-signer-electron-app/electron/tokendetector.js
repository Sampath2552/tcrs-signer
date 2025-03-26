// const { JavaCaller } = require("java-caller");

const {exec} = require("child_process")

const {paths,localEnv} = require("./messages")

const url = paths.sessionPath[localEnv]
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

                return
            }
            resolve({status:"0",stdout:stdout,stderr:stderr})
        })
    })
}

module.exports = tokencaller