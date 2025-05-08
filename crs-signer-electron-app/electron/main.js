const {app, BrowserWindow, globalShortcut, ipcMain, shell} = require("electron");
const url = require("url")
const https = require("https")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const path = require("path");
const os = require("os")
const {javacaller, stopJava} = require("./javacaller");
const tokencaller = require("./tokendetector")
const configUpdater = require("./configupdater")
const tokenverifer = require("./tokenverifier")
const {WebSocket} = require("ws");
const express = require('express')
const cors = require('cors')
const http = require('http');
const socketIo = require('socket.io');
const {dialog} = require("electron");
const {createPdf, readLog, deleteLog} = require("./pdfwriter")
const {signingStatusMessage, certificateExtractionMessages, paths, localEnv, buildEnv} = require("./messages")
const expressApp = express()
expressApp.use(cors());
expressApp.use(express.json({limit: '50mb'}));
expressApp.use(express.urlencoded({limit: '50mb', extended: true}));
const server = http.createServer(expressApp)

let userDir = os.homedir().split("\\");
let userCompleteId = userDir[userDir.length - 1]
let userId = userCompleteId.replace("tcs", '').replace("v", '')
let fileName = ''
const log = require("electron-log/main")
const idleTime = 5 * 60 * 1000
//let devFlag= false
log.initialize()
log.transports.file.resolvePathFn = () => path.join(__dirname, "app.log")
let window
const validationURL = paths.validationURLs[buildEnv] + "/Server/common/checkSigner"
let signedReportsList = []
const io = socketIo(server, {
    maxHttpBufferSize: "10mb", cors: {
        origin: ["https://localhost:3000", "https://crsdev.info.sbi", "https://crsuat.info.sbi", "https://sbicrs.info.sbi", "https://crs.sbi"],
        methods: ["GET", "POST"]
    }
})
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
})
const getIpAddress = () => {
    const networkInterfaces = os.networkInterfaces()
    for (const interfaceName in networkInterfaces) {
        for (const addressInfo of networkInterfaces[interfaceName]) {
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                return addressInfo.address
            }
        }
    }
    return "invalid"
}
io.on('connection', (socket) => {
    log.info(userId + "::" + 'CRS User trying to connect');

    socket.on('userverification', (msg) => {

        let crsLoggedInUserId = JSON.parse(msg).userId
        let bPF = JSON.parse(msg).bPF

        let ipAddress = getIpAddress()
        let successObj = {success: true, localUserId: userId, bPF: bPF, ipAddress}


        if (userId === crsLoggedInUserId || bPF) {

            window.webContents.send('crs-connected')
            log.info(userId + "::" + 'CRS User connected');

        } else {

            window.webContents.send("invalid-user", crsLoggedInUserId)
            successObj.success = false
            log.info(userId + "::" + 'Unauthorized User - Access Denied');
        }
        socket.emit('verification-result', JSON.stringify(successObj))
    })
    socket.on('message', (msg) => {

        initializeSocket()

        bringToForeground(window)
        const crsLoggedInUserId = JSON.parse(msg).userId
        const bPF = JSON.parse(msg).bPF
        if (userId === crsLoggedInUserId || bPF) {


            fileName = JSON.parse(msg).fileName

            log.info(userId + "::" + "Report Name  =" + fileName)
            window.webContents.send('render-pdf', JSON.parse(msg))


        } else {
            window.webContents.send('wrong-user', crsLoggedInUserId)
            log.info(userId + "::" + 'Unauthorized User - Access Denied');
        }

        // Broadcast the message to all clients
    });
    socket.on('multisign', (msg) => {
        //log.info(userId+"::"+msg)
        let reportsMsg = JSON.parse(msg)
        // log.info(userId+"::"+reportsMsg.reports)
        let userId = reportsMsg.userId

        let role = reportsMsg.role


        if (reportsMsg.reports !== null && reportsMsg.reports.length > 0) {
            window.webContents.send("show-reportlist", JSON.stringify(reportsMsg.reports))
            reportsMsg.reports.forEach((report) => {
                let objToSend = {}
                con.socket.send(JSON.stringify(objToSend))
            })
        }
        //  log.info(userId+"::"+"Signed Reports List = "+signedReportsList)
    })
    socket.on('acknowledgement', () => {
        window.webContents.send("acknowledgement-received")
        window.minimize()
        log.info(userId + "::" + "Signed PDF received by CRS")
    })
    socket.on('disconnect', () => {
        log.info(userId + "::" + 'User disconnected');
        window.webContents.send('crs-disconnected')
    });
    socket.on('log-acknowledgement', () => {
        deleteLog()
    })
});

const tokens = ["eMudhra", "SafeNet", "Gemalto 32 Bit", "Gemalto 64 Bit", "ePass", "SafeSign", "Trust Key", "Belgium eiD MiddleWare", "Aladin eToken", "Safe net I key", "StarKey", "Watchdata PROXkey", "mToken"
    , "HYPERSEC"
]
const dllPaths = ["eTPKCS11.dll", "eTPKCS11.dll", "IDPrimePKCS11.dll", "IDPrimePKCS1164.dll", "eps2003csp11.dll", "aetpkss1.dll", "wdpkcs.dll", "beidpkcs11.dll", "eTPKCS11.dll", "dkck201.dll", "aetpkssl.dll", "SignatureP11.dll", "CryptoIDA_pkcs11.dll"
    , "eps2003csp11v2.dll"
]
const DLL_CONSTANT_PATH = "C:\\Windows\\System32\\"
var sendLogToCrs;

let con = {};
const getTimeStamp = () => {
    const currentDate = new Date();
    return currentDate.toLocaleString("en-IN", {timeZone: "Asia/Kolkata"})
}
const initializeSocket = () => {
    let port = "2453"
    let protocol = "ws"
    let ip = "localhost";

    let wrl = protocol + "://" + ip + ":" + port
    try {
        let ws;
        try {
            ws = new WebSocket(wrl);
        } catch (err) {
            log.info(userId + "::" + "Couldn't initiate Session")
        }
        ws.onopen = function () {
            log.info(userId + "::" + 'Session Started');
            window.webContents.send("java-connected")
        };
        ws.onerror = function (error) {


            log.info(userId + "::" + "Error in Session ");
            // log.error("Error line ="+error)
            //javacaller()
        };
        // Response after sign
        ws.onmessage = function (e) {


            const socketResult = JSON.parse(e.data)

            if (socketResult === null) {
                window.webContents.send('show-configuration-status', null)
            } else {
                // log.info(userId+"::"+socketResult)
                if (socketResult.certs) {

                    window.webContents.send('show-certificates', e.data)

                } else if (socketResult.fromDll) {

                    window.webContents.send('show-dll-certificate', e.data)
                } else if (socketResult.status) {

                    if (socketResult.status === "111" && socketResult.multiSignFlag === "false") {
                        window.webContents.send('rerender-pdf', socketResult)
                        window.webContents.send('sending-to-socket')
                        let pdfName = fileName || "sample"
                        createPdf(pdfName, socketResult.signedData)
                        log.info(userId + "::" + "Sending Data to CRS")
                        io.emit('signed-data', e.data)

                        if (sendLogToCrs) {
                            clearTimeout(sendLogToCrs)
                        }
                        sendLogToCrs = setTimeout(async () => {
                            const log64Data = await readLog();
                            const ipAddress = getIpAddress()
                            const timeStamp = getTimeStamp()
                            const dataToSend = {
                                ipAddress,
                                timeStamp,
                                log64Data
                            }
                            io.emit('log-data', dataToSend);
                        }, idleTime)
                    } else if (socketResult.status === "111" && socketResult.multiSignFlag === "true") {
                        signedReportsList.push(e.data)
                    } else {

                        let msgObj = signingStatusMessage[socketResult.status]
                        //log.info(userId+"::"+msgObj)
                        window.webContents.send('show-sign-status', msgObj)
                        io.emit('sign-error', {error: true, ...msgObj})
                    }
                } else {
                    window.webContents.send('show-configuration-status', certificateExtractionMessages[socketResult.flag])
                }
            }


        };

        ws.onclose = function (event) {
            log.info(userId + "::" + "Session closed");
            if (!event.wasClean && event.code === 1006) {
                log.info(userId + "::" + "Abnormal Close")
                javacaller()
            }
            window.webContents.send("java-disconnected")
        };
        con = {socket: ws}
    } catch (err) {
        log.info(userId + "::" + "Session error");

    }


}
const openCrs = () => {
    //const externalUrl = devFlag===true ? "https://crsdev.info.sbi" : "https://sbicrs.info.sbi/CRS/"
    shell.openExternal("https://crs.sbi").then(r => (log.info(userId + "::" + "Browser Open")))
}
const renderTokens = (flag) => {


    if (flag === 1) {
        tokencaller().then(tokenResponse => {
            log.info(userId + "::" + tokenResponse)
            setTimeout(() => {
                window.webContents.send('render-tokens', tokenResponse)
            }, 2000)
        }).catch(err => {
            log.info(userId + "::" + err)
        })

    } else {

        tokencaller().then(tokenResponse => {
            log.info(userId + "::" + tokenResponse)

            window.webContents.send('render-tokens', tokenResponse)

        }).catch(err => {
            log.info(userId + "::" + "Issue in fetching tokens")
            log.error(err)
        })

    }

}
const bringToForeground = (window) => {
    if (window) {
        if (window.isMinimized()) {
            window.restore()
        } else {
            window.show()
            window.focus()
            window.setAlwaysOnTop(true)
            window.setAlwaysOnTop(false)
        }

    }
}
const openFilePicker = async () => {
    let result = await dialog.showOpenDialog(window, {
        defaultPath: "C:\\Windows\\System32",
        properties: ['openFile'],
        filters: [{name: 'DLL Files', extensions: ['dll']}],


    })
    if (!result.canceled) {
        // log.info(userId+"::"+result.filePaths[0])
        window.webContents.send('selected-file', result.filePaths[0])
    }


}
const
    createWindow = () => {

        window = new BrowserWindow({
            title: "CRS Digital Signer",
            width: 1440,
            height: 880,
            icon: "./applogo.ico",
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: true,
                preload: path.join(__dirname, 'preload.js'),
            },
        })

        window.maximizable = false
        const feUrl = paths.build[localEnv]
        const startUrl = url.format({

            pathname: path.join(__dirname, '../build/index.html'),
            protocol: 'file',
        });
        // window.setAlwaysOnTop(true)
        window.resizable = false
        window.movable = false
        window.setMenuBarVisibility(false)
        window.loadURL(startUrl);
        window.hookWindowMessage(278, () => {
            return true
        })

        // window.loadURL("http://localhost:3000/");
        renderTokens(1)
        javacaller()
        try {
            setTimeout(() => {
                initializeSocket()
            }, 3000)
        } catch (err) {
            log.info(userId + "::" + err)
            log.info(userId + "::" + "Trying to close the application")
        }

        return window


    }

const checkToken = (event, credentials) => {

    credentials = JSON.parse(credentials)
    let password = credentials.password

    tokenverifer(password).then(tokenResponse => {

        let popUpDetails = {}

        if (tokenResponse.stdout) {
            if (tokenResponse.stdout === '0') popUpDetails = {
                status: 0,
                header: "Invalid Password",
                description: "The password you have entered is invalid. Please try again"
            }
            else if (tokenResponse.stdout === '1') popUpDetails = {
                status: 1,
                header: "Token Configured",
                description: "The Token is succesfully configured and you can continue signing",
                password: password
            }
            else if (tokenResponse.stdout === '-1') popUpDetails = {
                status: -1,
                header: "No Token",
                description: "Error verifying the Token. Please try again with the appropriate Token"
            }
            else if (tokenResponse.stdout === '-2') popUpDetails = {
                status: -2,
                header: "Invalid DLL",
                description: "Please verify whether you have selected the correct dll. Verify whether the token dll is installed or not."
            }
        }
        window.webContents.send('show-configuration-status', popUpDetails)

    }).catch(err => {
        log.info(userId + "::" + err)
    })

}

const sendToSocket = (content) => {
    if (con.socket) {
        log.info(userId + "::" + "Session  State=" + con.socket.readyState)
        if (con.socket.readyState === WebSocket.OPEN) {
            log.info(userId + "::" + "Session is Open and Sending Content")

            con.socket.send(content)
        } else if (con.socket.readyState === WebSocket.CONNECTING) {
            log.info(userId + "::" + "Session is in Connected State")
            setTimeout(() => {
                sendToSocket(content)
            }, 3000)
        } else {
            log.info(userId + "::" + "Session is Closed or in Closing State")
            initializeSocket()
            setTimeout(() => {
                sendToSocket(content)
            }, 5000)
        }
    } else {
        setTimeout(() => {
            sendToSocket(content)
        }, 3000)
    }
}

const sendContent = (event, content) => {

    //
    //
    // log.info(userId+"::"+`fileName in node = ${fileName} file name node got = ${content}`)

    sendToSocket(content)

}
const getCertificates = (event) => {
    const certificateRequest = {
        flagForSigning: "2",
        dllSigningFlag: "false"
    }
    sendToSocket(JSON.stringify(certificateRequest))
}
const sendClose = () => {
    io.emit('render-close', {error: false})

}
const sendQuitEvent = () => {
    log.info(userId + "::" + "Inside Quit Event")
    const quitEventData = {flagForSigning: "0"}
    if (con != null) {
        con.socket.send(JSON.stringify(quitEventData))
    }

}
const configureNewToken = async (event, newTokenDetails) => {
    //const name = "token"
    log.info(userId + "::" + "Sending for DLL Cert Extraction")
    const tokenPath = newTokenDetails.selectedFilePath
    const slotIndex = newTokenDetails.slotIndex
    // log.info(userId+"::"+newTokenDetails)
    const fileWritingStatus = await configUpdater(`name=crs\nlibrary=${tokenPath}\nslot=${slotIndex}`)
    if (fileWritingStatus) {
        // log.info(userId+"::"+{...newTokenDetails,dllSigningFlag:"true",flagForSigning:"2"})
        sendToSocket(JSON.stringify({...newTokenDetails, flagForSigning: "2", dllSigningFlag: "true"}))
    }
}
const sendCertificateNotConfigured = () => {
    io.emit('not-configured', {
        message: "Choose Certificate before trying to sign",
        error: false
    })
}
const configChanger = (event, details) => {
    //const name ="token"
    const tokenname = details.toLowerCase()
    let index = -1

    for (let i = 0; i < tokens.length; i++) {
        if (tokenname.includes(tokens[i].toLowerCase())) {
            index = i


        }
    }
    if (index == -1) {
        log.info(userId + "::" + "Invalid Token Configuration")
        window.webContents.send('config-invalid')
    } else {
        let dllPath = dllPaths[index]
        configUpdater(`name=crs\nlibrary=${DLL_CONSTANT_PATH + dllPath}`)
        window.webContents.send('config-valid')
    }

}
app.on('before-quit', () => {


    sendQuitEvent()
    stopJava()
})
app.on('win-all-closed', () => {

    app.quit()
})
// This will make sure only one instance of the app can run at a time
// if (!app.requestSingleInstanceLock()) {
//   log.info(userId+"::"+"Another instance is already running. Exiting...");
//   app.quit();  // If another instance is trying to start, quit the app
//   process.exit(0);
// }
app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Quit the app if another instance tries to launch
    log.info(userId + "::" + "Another instance is trying to launch. Exiting...");
    app.quit();
});
app.whenReady().then(async () => {
        // ipcMain.on('start-Jar',startJar)
        ipcMain.on('sign-content', sendContent)
        ipcMain.on('render-tokens', renderTokens)
        ipcMain.on('change-config', configChanger)
        ipcMain.on('check-token', checkToken)
        ipcMain.on('configure-newtoken', configureNewToken)
        ipcMain.on('open-filepicker', openFilePicker)
        ipcMain.on('get-certificates', getCertificates)
        ipcMain.on('open-crs', openCrs)
        ipcMain.on('send-close', sendClose)
        ipcMain.on('not-configured', sendCertificateNotConfigured)
        globalShortcut.register('Control+Shift+I', () => {
            // When the user presses Ctrl + Shift + I, this function will get called
            // You can modify this function to do other things, but if you just want
            // to disable the shortcut, you can just return false
            return false;
        });
        globalShortcut.register('Control+R', () => {
            return false;
        });

        globalShortcut.register('Control+Shift+R', () => {
            return false;
        })

        try {
            console.log(validationURL)
            const validationResponseData = await fetch(validationURL, {
                method: "POST",
                body: JSON.stringify({
                    userId: userId,

                }),
                headers: {
                    "Content-Type": "application/json"
                },
                agent: httpsAgent
            })
            const validationResponse = await validationResponseData.json()
            if (validationResponse.result && validationResponse.result.status === true) {

                if (validationResponse.result.version === "1.0.0") {
                    log.info(userId + "::" + "Version Valid")
                    if (validationResponse.result.validity === true) {
                        log.info(userId + "::" + "Validation Check and Status - Success")
                        createWindow();
                    } else {
                        log.info(userId + "::" + "Unauthorized Access")
                        log.info(userId + "::" + "Invalid User")
                        const messageBoxOptions = {
                            type: "error",
                            title: "CRS Digital Signer",
                            message: "You are unauthorized to access this application."
                        }
                        dialog.showMessageBoxSync(messageBoxOptions)
                        app.exit(1)
                    }

                } else {
                    log.info(userId + "::" + "Wrong Version")
                    log.info(userId + "::" + "Outdated Version:")
                    const messageBoxOptions = {
                        type: "error",
                        title: "CRS Digital Signer - Outdated Version",
                        message: `You are using outdated version. Please install latest version.`
                    }
                    dialog.showMessageBoxSync(messageBoxOptions)
                    app.exit(1)
                }

            } else {
                log.info(userId + "::" + "Cannot run the application.Code:1970")
                const messageBoxOptions = {
                    type: "error",
                    title: "CRS Digital Signer",
                    message: "You are unauthorized to access this application. Code:1970"
                }
                log.info(userId + "::" + "Validation Check Failed")
                dialog.showMessageBoxSync(messageBoxOptions)
                app.exit(1)
            }
        } catch (e) {
            log.info(userId + "::" + "Cannot run the application.Code:1870")
            log.info(userId + "::" + "Validation Failed")
            const messageBoxOptions = {
                type: "error",
                title: "CRS Digital Signer",
                message: "You are unauthorized to access this application. Code:1971"
            }
            dialog.showMessageBoxSync(messageBoxOptions)
            app.exit(1)

        }

    }
)


server.on('error', () => {
    process.exit(0)
})

server.listen(8555, () => {
    console.log("Application running in the system ")
})
