
const fs = require('fs')
const os = require('os');
const path = require('path');
const configUpdater = async (details) =>{

    const CFG_FILE_PATH = os.homedir+ path.sep + "AppData" + path.sep + "Roaming" + path.sep +"TCRS-Signer" +path.sep + "config.cfg"
    const CFG_FOLDER_PATH = os.homedir+ path.sep + "AppData" + path.sep + "Roaming" + path.sep +"TCRS-Signer"
    
    if(!fs.existsSync(CFG_FOLDER_PATH))
    {
        fs.mkdirSync(CFG_FOLDER_PATH)
    }
    fs.writeFile(CFG_FILE_PATH,details,err=>{

        if(err) return false
    })
    return true
}

module.exports = configUpdater