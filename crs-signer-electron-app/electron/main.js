
const {app,BrowserWindow, globalShortcut,ipcMain,shell} = require("electron");
const url = require("url")
const path = require("path");
const os = require("os")
const {javacaller,stopJava} = require("./javacaller");
const tokencaller = require("./tokendetector")
const configUpdater = require("./configupdater")
const tokenverifer = require("./tokenverifier")
const {WebSocket}= require("ws");
const exp = require("constants");
const express = require('express')
const cors = require('cors')
const http = require('http');
const socketIo = require('socket.io');
const { dialog } = require("electron");
const {createPdf} = require("./pdfwriter")
const {EventEmitter} = require("events");
const { json } = require("stream/consumers");
const { report } = require("process");
const {signingStatusMessage,certificateExtractionMessages} = require("./messages")
const emitter = new EventEmitter()
const expressApp = express()
expressApp.use(cors());
expressApp.use(express.json({ limit: '50mb'}));
expressApp.use(  express.urlencoded({ limit: '50mb',extended: true }));
const server = http.createServer(expressApp)

let userDir = os.homedir().split("\\");
let userCompleteId = userDir[userDir.length - 1]
let userId = userCompleteId.replace("tcs",'').replace("v",'')
let fileName=''
let window

let signedReportsList = []
const io = socketIo(server,{maxHttpBufferSize:"10mb",cors:{
  origin:"*",
}})
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('userverification',(msg)=>{
    let successObj = {success:false}
    let crsLoggedInUserId = JSON.parse(msg).userId
    let byPassFlag = JSON.parse(msg).byPassFlag
    if(userId===crsLoggedInUserId)
    {

      window.webContents.send('crs-connected')
      successObj = {success:true}
      
    }
    else if(byPassFlag)
    {
        window.webContents.send('crs-connected')
    }
    else
    { 
      
      window.webContents.send("invalid-user",crsLoggedInUserId)
    }
    socket.emit('verification-result',JSON.stringify(successObj))
  })
  socket.on('message', (msg) => {

      initializeSocket()

      bringToForeground(window)
      const crsLoggedInUserId = JSON.parse(msg).userId
      const byPassFlag = JSON.parse(msg).byPassFlag
      if(userId===crsLoggedInUserId || byPassFlag)
      {
        

          fileName = JSON.parse(msg).fileName
      
          console.log("File Name ="+fileName)
          window.webContents.send('render-pdf',JSON.parse(msg))


      }
      else
      {
        window.webContents.send('wrong-user',crsLoggedInUserId)
      }
     
    // Broadcast the message to all clients
  });
  socket.on('multisign',(msg)=>{
    //console.log(msg)
      let reportsMsg = JSON.parse(msg)
      // console.log(reportsMsg.reports)
      let userId = reportsMsg.userId
      
      let role = reportsMsg.role

      

      
      if(reportsMsg.reports!==null && reportsMsg.reports.length>0)
      
      {
        window.webContents.send("show-reportlist",JSON.stringify(reportsMsg.reports))
        reportsMsg.reports.forEach((report)=>{
          let objToSend = {
            userId,
            role,
            multiSignFlag:"true",
            flagForSigning:"1",
            dllSigningFlag:"false",
            fileName: report.fileName,
            data: report.data,
            alias:"ANIL BABU KAYALORATH",
            reportId: report.reportId
          }
          con.socket.send(JSON.stringify(objToSend))
        })
      }
    //  console.log("Signed Reports List = "+signedReportsList)
  })
  socket.on('acknowledgement',()=>{
      window.webContents.send("acknowledgement-received")
  })
  socket.on('disconnect', () => {
      console.log('User disconnected');
      window.webContents.send('crs-disconnected')
  });
});

const tokens=["eMudhra","SafeNet","Gemalto 32 Bit","Gemalto 64 Bit","ePass","SafeSign","Trust Key","Belgium eiD MiddleWare","Aladin eToken","Safe net I key","StarKey","Watchdata PROXkey","mToken"
   ,"HYPERSEC"
]
const dllPaths=["eTPKCS11.dll","eTPKCS11.dll","IDPrimePKCS11.dll","IDPrimePKCS1164.dll","eps2003csp11.dll","aetpkss1.dll","wdpkcs.dll","beidpkcs11.dll","eTPKCS11.dll","dkck201.dll","aetpkssl.dll","SignatureP11.dll","CryptoIDA_pkcs11.dll"
   ,"eps2003csp11v2.dll"
  ]
const DLL_CONSTANT_PATH = "C:\\Windows\\System32\\"


let con = {};
const initializeSocket = () => {
    let port="2453"
    let protocol ="ws"
    let ip="localhost";
    javacaller()
    let wrl = protocol +"://"+ip+":"+port
    console.log(wrl)
    try{
      let ws;
      try{
         ws = new WebSocket(wrl); 
      }
      catch(err)
      {
        console.log("Inside Error Statement")
      }
      ws.onopen = function () {
        console.log('ws Opened');
        window.webContents.send("java-connected")
      };
      ws.onerror = function (error) {
        console.log("Error in J Socket "+JSON.stringify(error));
        javacaller()
      };
      // Response after sign 
      ws.onmessage = function (e) {
        
      
        const socketResult = JSON.parse(e.data)

        if(socketResult===null)
        {
          window.webContents.send('show-configuration-status',null)
        }
        else
        {
         // console.log(socketResult)
          if(socketResult.certs)
          {
           console.log("Triggering show-certificates event")
             window.webContents.send('show-certificates',e.data)

          }
          else if(socketResult.fromDll)
          {
              window.webContents.send('show-dll-certificate',e.data)
          }
          else if(socketResult.status)
          {
            
          if(socketResult.status==="111" && socketResult.multiSignFlag==="false")
            {
              window.webContents.send('rerender-pdf',socketResult)
              window.webContents.send('sending-to-socket')
              let pdfName = fileName || "sample"
              createPdf(pdfName,socketResult.signedData)
    
             
            
            io.emit('signed-data',e.data)
            }
            else if(socketResult.status==="111" && socketResult.multiSignFlag==="true")
            {
              signedReportsList.push(e.data)
            }
            else
    
            { 
              
              let msgObj = signingStatusMessage[socketResult.status]
              //console.log(msgObj)
              window.webContents.send('show-sign-status',msgObj)
            }
          }
          else
          {
              window.webContents.send('show-configuration-status',certificateExtractionMessages[socketResult.flag])
          }
        }
      
  
      };
  
      ws.onclose = function () {
        console.log(" ws closed");
        window.webContents.send("java-disconnected")
      };
       con = {socket: ws}
    }
    catch(err)
    {
      console.log("Inside error log");
      
    }
  
    
  }
const openCrs= ()=>{
    shell.openExternal("https://sbicrs.info.sbi/CRS").then(r => (console.log("Browser Open")))
}
const renderTokens = (flag) =>{


  if(flag===1)
  {
    tokencaller().then(tokenResponse=>{
      console.log(tokenResponse)
      setTimeout(()=>{
        window.webContents.send('render-tokens',tokenResponse)
      },2000)
    }).catch(err=>{
      console.log(err)
    })

  }
  else
  {
   
    tokencaller().then(tokenResponse=>{
      console.log(tokenResponse)
      
        window.webContents.send('render-tokens',tokenResponse)
      
    }).catch(err=>{
      console.log(err)
    })
    
  }
 
}
const bringToForeground = (window)=>
{
  if(window)
  {
    if(window.isMinimized())
    {
      window.restore()
    }
    else
    { 
      window.show()
      window.focus()
      window.setAlwaysOnTop(true)
     window.setAlwaysOnTop(false)
    }
   
  }
}
const openFilePicker = async ()=>{
 let result = await  dialog.showOpenDialog(window,{
    defaultPath:"C:\\Windows\\System32",
    properties:['openFile'],
    filters:[{name:'DLL Files',extensions:['dll']}],
    
  
})
  if(!result.canceled)
  {
    console.log(result.filePaths[0])
    window.webContents.send('selected-file',result.filePaths[0])
  }
  
  
}
const
    createWindow =  ()=>{
    
    window = new BrowserWindow({
        title:"CRS PDF - Signer",
        width:1440,
        height:880,
        icon:"./tcrs_logo.ico",
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
          },
    })
    
    window.maximizable=false
    const startUrl = url.format({
        pathname: path.join(__dirname, '../app/build/index.html'),
        protocol: 'file',
      });
      // window.setAlwaysOnTop(true)
    window.resizable = false
    window.movable=false
    window.setMenuBarVisibility(false)
     window.loadURL(startUrl);
     window.hookWindowMessage(278,()=>{return true})
    
    // window.loadURL("http://localhost:3000/");
    renderTokens(1)
      javacaller()
      try{
        setTimeout(()=>{
          initializeSocket()
        },3000)
      }
      catch(err)
      {
        console.log(err)
        console.log("Trying to close")
      }
     
      return window
   
   
}

const checkToken = (event,credentials) =>{
 
  credentials=JSON.parse(credentials)
  let password = credentials.password

  tokenverifer(password).then(tokenResponse=>{
    
       let popUpDetails = {}
   
      if(tokenResponse.stdout)
      {
        if(tokenResponse.stdout==='0') popUpDetails = {status:0,header:"Invalid Password",description:"The password you have entered is invalid. Please try again"}
        else if(tokenResponse.stdout==='1') popUpDetails = {status:1,header:"Token Configured",description:"The Token is succesfully configured and you can continue signing",password:password}
        else if(tokenResponse.stdout==='-1') popUpDetails = {status:-1,header:"No Token",description:"Error verifying the Token. Please try again with the appropriate Token"}
        else if(tokenResponse.stdout==='-2') popUpDetails ={status:-2, header:"Invalid DLL",description:"Please verify whether you have selected the correct dll. Verify whether the token dll is installed or not."}
      }
      window.webContents.send('show-configuration-status',popUpDetails)
    
  }).catch(err=>{
    console.log(err)
  })
  
}

const sendToSocket = (content) =>{
  if(con.socket){
    if(con.socket.readyState === WebSocket.OPEN)
      { console.log("Socket is Open and Sending Content")
         
          con.socket.send(content)
      }
    else if (con.socket.readyState === WebSocket.CONNECTING)
    { console.log("Socket is in Connection State")
      setTimeout(()=>{
          sendToSocket(content)
      },3000)
    }
    else
    { console.log("Socket is Closed or in Closing State")
      initializeSocket()
      setTimeout(()=>{
        sendToSocket(content)
      },5000)
    }
  }
  else
  {
    setTimeout(()=>{
      sendToSocket(content)
    },3000)
  }
}

const sendContent = (event,content)=>{
        
        //
        //
        // console.log(`fileName in node = ${fileName} file name node got = ${content}`)
        
       sendToSocket(content)

}
const getCertificates = (event) =>{
  const certificateRequest = {
      flagForSigning:"2",
      dllSigningFlag: "false"
  }
  sendToSocket(JSON.stringify(certificateRequest))
}
const sendQuitEvent = ()=>{
  console.log("Inside Quit Event")
  const quitEventData = {flagForSigning:"0"}
  if(con!=null)
  {
    con.socket.send(JSON.stringify(quitEventData))
  }
  
}
const configureNewToken= async (event,newTokenDetails)=>
{
  //const name = "token"
    console.log("Sending for DLL Cert Extraction")
  const tokenPath=newTokenDetails.selectedFilePath
  const slotIndex = newTokenDetails.slotIndex
  console.log(newTokenDetails)
  const fileWritingStatus =await configUpdater(`name=crs\nlibrary=${tokenPath}\nslot=${slotIndex}`)
  if(fileWritingStatus)
  {
      console.log({...newTokenDetails,dllSigningFlag:"true",flagForSigning:"2"})
    sendToSocket(JSON.stringify({...newTokenDetails,flagForSigning:"2",dllSigningFlag: "true"}))
  }
}
const configChanger= (event,details) =>{
  //const name ="token"
  const tokenname = details.toLowerCase()
  let index =-1

  for(let i=0;i<tokens.length;i++)
  {
    if (tokenname.includes(tokens[i].toLowerCase()))
    {
      index =i
    
    
    }
  }
  if(index==-1)
  {
    window.webContents.send('config-invalid')
  }
  else
  {
    let dllPath = dllPaths[index]
  configUpdater(`name=crs\nlibrary=${DLL_CONSTANT_PATH+dllPath}`)
  window.webContents.send('config-valid')
  }
  
}
app.on('before-quit',()=>{
  
  console.log(signedReportsList)
  sendQuitEvent()
})
app.on('win-all-closed',()=>{

  app.quit()
})
// This will make sure only one instance of the app can run at a time
// if (!app.requestSingleInstanceLock()) {
//   console.log("Another instance is already running. Exiting...");
//   app.quit();  // If another instance is trying to start, quit the app
//   process.exit(0);
// }
app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Quit the app if another instance tries to launch
  console.log("Another instance is trying to launch. Exiting...");
  app.quit();
});
app.whenReady().then(()=>{
    // ipcMain.on('start-Jar',startJar)
    ipcMain.on('sign-content',sendContent)
    ipcMain.on('render-tokens',renderTokens)
    ipcMain.on('change-config',configChanger)
    ipcMain.on('check-token',checkToken)
    ipcMain.on('configure-newtoken',configureNewToken)
    ipcMain.on('open-filepicker',openFilePicker)
    ipcMain.on('get-certificates',getCertificates)
    ipcMain.on('open-crs',openCrs)
  //   globalShortcut.register('Control+Shift+I', () => {
  //     // When the user presses Ctrl + Shift + I, this function will get called
  //     // You can modify this function to do other things, but if you just want
  //     // to disable the shortcut, you can just return false
  //     return true;
  // });
  // globalShortcut.register('Control+R', () => {return false;});
  globalShortcut.register('Control+Shift+R',()=>{return false;})
    createWindow()
}
    
    
    )
   
// expressApp.post('/',(req,res)=>{
//   console.log("Server Hit")
//   console.log(req.body)
//   initializeSocket()
//   window.webContents.send('render-pdf',req.body)
//   res.json({"status":"101"})
// })
// expressApp.listen(9652,()=>{console.log("Listening on Port 9652")})
server.on('error',()=>{
  process.exit(0)
})

server.listen(8555,()=>{
  console.log("Server Listening on Port 8555")})
