const { channel } = require('diagnostics_channel');
const { contextBridge, ipcRenderer } = require('electron');
const os = require('os');

contextBridge.exposeInMainWorld('electron', {
  homeDir: () => os.homedir(),
  ipcRenderer:{
    send:(channel,data) =>{
      ipcRenderer.send(channel,data)
    },
    on:(channel,func) => ipcRenderer.on(channel,(event,...args)=>func(args))
  }
});
contextBridge.exposeInMainWorld('signer',{
    startJar:() => ipcRenderer.send('start-Jar'),
    sendData: (contentObject) => ipcRenderer.send('sign-content',contentObject),
    refreshTokens : () => ipcRenderer.send('render-tokens'),
    changeConfig: (details)=> ipcRenderer.send('change-config',details),
    configureNewToken: (newTokenDetails) => ipcRenderer.send('configure-newtoken',newTokenDetails),
    checkToken: (credentials) => ipcRenderer.send('check-token',credentials) ,
    openFilePicker:()=>ipcRenderer.send('open-filepicker')
})
