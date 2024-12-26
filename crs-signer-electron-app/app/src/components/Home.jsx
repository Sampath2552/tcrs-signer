import * as React from 'react';
// import {Card,} from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Navbar from "./Navbar";
import {
    Divider,
    Box,
    List,
    ListItem,
    ListItemText,
    Container,
    TextField,
    CardMedia,
    Card
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from "@mui/material/IconButton";
import UsbIcon from '@mui/icons-material/Usb';
import UsbOffIcon from '@mui/icons-material/UsbOff';
import {useState, useEffect} from "react";
import SignReadyStatus from "./SignReadyStatus";
import FileChangeCard from "./FileChangeCard";
import PopupModal from './PopupModal';
import ListItemButton from '@mui/material/ListItemButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PdfView from './PDFView';
import CopyRight from './CopyRight';
import BorderLinearProgress from './BorderLinearProgress';
import { ProgressBar } from '@react-pdf-viewer/core';
import ProgressComponent from './ProgressComponent';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
let userDir = window.electron.homeDir().split("\\");
let userCompleteId = userDir[userDir.length - 1]
let userId = userCompleteId.replace("tcs",'').replace("v",'')
export default function Home() {
    const [sendingToSigner, setSendingToSigner] = useState(false)
    const [sendingToSocket, setSendingToSocket] = useState(false)
    const [sentToSocket, setSentToSocket] = useState(false)
    const [tokens, setTokens] = useState([]);
    const [popupOpen, setPopupOpen] = useState(false);
    const [popupProps, setPopupProps] = useState({title: "", description: ""});
    const [isTokenConfigured, setIsTokenConfigured] = useState(false)
    const [showSignStatus, setShowSignStatus] = useState(true);
    const [showFileChangeCard, setshowFileChangeCard] = useState(false);
    const [showUsbOffIconIndex, setShowUsbOffIconIndex] = useState(null);
    const [isCrsConnected, setIsCrsConnected] = useState(false);
    const [showPdfScreen, setShowPdfScreen] = useState(false)
    const [pdfData, setPdfData] = useState(null)
    const [renderFlag, setRenderFlag] = useState(false)
    const [role, setRole] = useState('')
    const [openLoader,setOpenLoader] = useState(false)
    const [showSignButton,setShowSignButton] = useState(false)
    const [selectedTokenName,setSelectedTokenName] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [showSigningProgress, setShowSigningProgress] = useState(false)
    let flag = true;
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };
 
    // const addToken = (newToken)=>{
    //     setTokens(prevTokens=>[...prevTokens, newToken]);
    // }
  
    const handleProgressClose = ()=>{
        setSentToSocket(false)
    }
    const refreshTokens = () => {
        window.signer.refreshTokens()
    }
    
    const setPassword = (pwd) => {
        localStorage.setItem("password", pwd)
        setTimeout(() => {
            localStorage.clear()
        }, 1800000)
    }
    // const changeSendingToSigner()
    const changePdfScreenStatus = () => {
        // if (showPdfScreen === true) setShowPdfScreen(false)
        // else 
    setShowPdfScreen(!showPdfScreen)
    }
    const

        changeSendingToSignerStatus = () => {
            console.log("Change Sending to Signer")
            if (sendingToSigner === true) setSendingToSigner(false)
            else setSendingToSigner(true)

        }
    useEffect(() => {
        localStorage.clear()
        window.electron.ipcRenderer.on("clear-local",()=>{
            localStorage.clear()
        })
        window.electron.ipcRenderer.on("wrong-user",(response)=>{
            const crsLoggedInUserId = response[0]
            setIsCrsConnected(false)
            localStorage.setItem("isCrsConnected","false")
            openPopup("Wrong User",`You have Logged in as  User - ${userId} in TCRS - Signer`,`and as User - ${crsLoggedInUserId} in CRS. `)
        })
        window.electron.ipcRenderer.on("invalid-user",(response)=>{
            const crsLoggedInUserId = response[0]
            setIsCrsConnected(false)
            localStorage.setItem("isCrsConnected","false")
            openPopup("Wrong User",`You have Logged in as  User - ${userId} in TCRS - Signer`,`and as User - ${crsLoggedInUserId} in CRS. `)
        })
        window.electron.ipcRenderer.on("crs-connected", () => {

            setIsCrsConnected(true);
            localStorage.setItem("isCrsConnected","true")


        })
        window.electron.ipcRenderer.on("config-valid",()=>{
            handlePwdDialogClickOpen()
        })
        window.electron.ipcRenderer.on("config-invalid",()=>{
            setshowFileChangeCard((prevState) => !prevState);
            setShowSignStatus((prevState) => !prevState);
        })
        window.electron.ipcRenderer.on("sending-to-socket", () => {

            setTimeout(() => {
                setSendingToSocket(true);
            }, 1000);
        })
        window.electron.ipcRenderer.on("crs-disconnected", () => {
            setIsCrsConnected(false);
            localStorage.setItem("isCrsConnected","false")
        })
        window.electron.ipcRenderer.on("show-configuration-status", (response) => {
            
            if(response[0]===null)
            {
                openPopup("Signing Failed","Signing Failed.Please try again")
                setSendingToSigner(false)
            }
            else
            {
                const header = response[0].header
            const status = response[0].status
            setOpenLoader(false)
            console.log(JSON.stringify(response[0]))
            console.log(header)
            
            const description = response[0].description
            console.log(description)

            openPopup(header, description,'')
            
            if (status == 1) {
                setPassword(response[0].password)
                console.log(response[0])
                setIsTokenConfigured(true)
                localStorage.setItem("isTokenConfigured","true")
                setshowFileChangeCard(false)
                setShowSignStatus(true)
            } else {
                localStorage.setItem("isTokenConfigured","false")
                setSendingToSigner(false)
                
            }
            }
            
        })
        window.electron.ipcRenderer.on("acknowledgement-received",()=>{
            setSendingToSigner(false)
            setSendingToSocket(false)
            setSentToSocket(true)
        })
        window.electron.ipcRenderer.on("render-tokens", (response) => {
            console.log(JSON.stringify(response[0]))
            // window.alert(JSON.stringify(response[0]))
            if (response[0].status == 0) {
                if (response[0].stdout !== "0\r\n") {
                    console.log(response[0].stdout)
                    let tokens = response[0].stdout.split("0\r\n")

                    tokens.pop()
                    setTokens(tokens)

                }

            }

        })
        window.electron.ipcRenderer.on("render-pdf", (response) => {

            let dataObject = response[0]
            //   console.log("Data Object = " + JSON.stringify(dataObject))
            let tokenConfigStatus = localStorage.getItem("isTokenConfigured")
            let crsConnectionStatus = localStorage.getItem("isCrsConnected")
            console.log("isTokenConfigured="+tokenConfigStatus+" isCrsConnected="+crsConnectionStatus)
            if (tokenConfigStatus==="true" && crsConnectionStatus==="true")
            {
                setPdfData(dataObject.data)
                
                console.log(pdfData)
                setRole(dataObject.role)
                setShowPdfScreen(true)
                setShowSignButton(true)
                localStorage.setItem("fileName",dataObject.fileName)
            }
            else
            {
                if(tokenConfigStatus===null || tokenConfigStatus==="" ||  tokenConfigStatus==="false" )
                {
                    openPopup("Token not configured","Configure token  before trying to sign",'')
                }
            }




        })
        window.electron.ipcRenderer.on("rerender-pdf", (response) => {
            let dataObject = response[0]
            setShowSignButton(false)
            setPdfData(dataObject.signedData)
            setShowPdfScreen(true)
            setSendingToSigner(false)
            // setTimeout(()=>{
            //     setSendingToSigner(false)
            // },4000)
            //   console.log("Inside Rerender Pdf="+ JSON.stringify(dataObject))
            setTimeout(() => {
                // console.log(pdfData)

            }, 2000)
        })
    }, [flag])


    const handleClickSettings = () => {
        setshowFileChangeCard((prevState) => !prevState);
        setShowSignStatus((prevState) => !prevState);
    }

    const handleClickFetchTokens = () => {
        refreshTokens()
    }
    const [open, setOpen] = React.useState(false);

    const handlePwdDialogClickOpen = () => {
        setOpen(true);
    };

    const handlePwdDialogClose = () => {
        setOpen(false);
        setOpenLoader(false)
    };

    const handleMountToken = (tokenIndex, tokenName) => {

        setShowUsbOffIconIndex(tokenIndex);
        setIsTokenConfigured(false)
        localStorage.setItem("isTokenConfigured","false")
        setSelectedTokenName(tokenName)
        window.signer.changeConfig(tokenName)
        // let storedPassword = localStorage.getItem("password")
        // if(storedPassword)
        // {
        //     let token ={userId:userId,password:storedPassword,flagForSigning:"0"}
        //     window.alert(JSON.stringify(token))
        //     window.signer.checkToken( JSON.stringify(token))
        // }
        // else{

        // }
     
    }

    const openPopup = (title, description,description1) => {
        setPopupProps({title, description,description1});
        setPopupOpen(true);
    }
    const handleProgressBackToHome = ()=>
    {
        //changePdfScreenStatus()
        setShowPdfScreen(false)
        setSentToSocket(false)
    }
    const configureNewToken=(inputData)=>{
            window.signer.configureNewToken(inputData)
    }
    return (

        <Box sx={{position: "relative", height: "100vh"}}>
                        <Backdrop
            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
            open={openLoader}
            
            >
                  <CircularProgress color="inherit" />
            </Backdrop>
            <Navbar handleClickSettings={handleClickSettings}/>
         
            {/* <Button onClick={() => { dp() }}>AV</Button> */}
            <PopupModal title={popupProps.title} description={popupProps.description} description1={popupProps.description1} popupOpen={popupOpen}
                            setPopupOpen={setPopupOpen}/>
            {(showPdfScreen && pdfData) ? (<>

                <PdfView pdfData={pdfData} role={role}  changePdfScreenStatus={changePdfScreenStatus}
                    setOpenLoader={setOpenLoader} showSignButton={showSignButton} setShowSignButton={setShowSignButton} setSendingToSigner={setSendingToSigner}/>

            </>) : (<><Box display={"flex"} sx={{
                m: 3,
                p: 4,
                border: '1px solid black',
                borderRadius: 5,
                backgroundColor: "#E5E4E2",
                justifyContent: {xs: "space-between", md: "space-between", lg: "space-evenly"}
            }}>
                
                <Card sx={{width: "25rem", height: "25rem", p: 1.5, borderRadius: 5, boxSizing: 'border-box'}}>
                    {
                        showFileChangeCard ?
                         <FileChangeCard setOpenLoader={setOpenLoader} selectedTokenName={selectedTokenName} configureNewToken={configureNewToken}/> :
                         ( 
                                <CardMedia component="img" image="./Assets/HomePageImage.png" sx={{height:"100%",borderRadius:"5px" ,width:"100%", margin:"auto"}}></CardMedia>
                                
                            
                            )
                    }
                </Card>


                <Box display={"flex"} flexDirection={"column"} sx={{
                    maxWidth: "20rem",
                    height: "25rem",
                    border: showFileChangeCard ? "" : "1px solid black",
                    borderRadius: 5,
                    boxSizing: 'border-box',
                    position: "relative"
                }}>
                    <Container sx={{p: 2.5, pt: 1.5}}>
                        <Box sx={{color: "#808080", mb: 0}}>
                            <Typography fontSize={10} component="span">
                                If your DSC token not shown Click to fetch
                            </Typography>
                            <IconButton onClick={handleClickFetchTokens}>
                                <RefreshIcon sx={{p: 0, m: 0, width: 35, height: 35, mb: -1.5}}/>
                            </IconButton>
                        </Box>

                        <Typography variant="h6" align="left" color="#36454F" sx={{fontWeight: 'bold'}}>
                            DSC Plugged in
                        </Typography>
                        <Divider orientation="horizontal" flexItem color="#808080" sx={{borderBottomWidth: 2}}/>


                        <List sx={{
                            width: '100%',
                            maxWidth: "20rem",
                            overflow: 'auto',
                            maxHeight: showFileChangeCard ? '16rem' : '8rem'
                        }}>
                            {tokens.map((value, index) => {
                                const labelId = `list-label-${value}`;

                                return (
                                    <ListItem
                                        key={value}
                                        secondaryAction={
                                            <IconButton edge="end">
                                                {(showUsbOffIconIndex === index) && (isTokenConfigured) ?
                                                     <UsbIcon sx={{color: "green"}}/>
                                                    :<UsbOffIcon sx={{color: "red"}} />}
                                            </IconButton>
                                        }
                                        disablePadding
                                    >
                                        <ListItemButton role={undefined} id={labelId} primary={value} onClick={() => handleMountToken(index, value)} dense>

                                            <ListItemText id={labelId} primary={value}
                                                          />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>


                    </Container>

                    {
                        showSignStatus ? <SignReadyStatus isCrsConnected={isCrsConnected}
                                                          isTokenConfigured={isTokenConfigured}/> : ""
                    }

                </Box>

            </Box>
                <Dialog
                    open={open}
                    onClose={handlePwdDialogClose}

                    PaperProps={{
                        component: 'form',
                        sx: {borderRadius: 3},
                        onSubmit: (event) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const formJson = Object.fromEntries(formData.entries());
                            const password = formJson.tokenpass;
                            console.log(password);
                            let token = {userId: userId, password: password}
                            handlePwdDialogClose();
                            // window.alert(JSON.stringify(token))
                            setOpenLoader(true)
                            window.signer.checkToken(JSON.stringify(token))
                        },
                    }}
                >
                    <DialogTitle sx={{fontSize: "1rem"}}>Enter Token Password</DialogTitle>

                    <DialogContent>

                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="name"
                            name="tokenpass"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            variant="standard"
                            inputProps={{
                                endAdornment:  <InputAdornment position="end">
                                <IconButton
                                  aria-label={
                                    showPassword ? 'hide the password' : 'display the password'
                                  }
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
                                  onMouseUp={handleMouseUpPassword}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                              }}
                        />
                    </DialogContent>
                    <DialogActions sx={{justifyContent: "space-evenly"}}>
                        <Button sx={{fontSize: "0.8rem"}} onClick={handlePwdDialogClose}>Cancel</Button>
                        <Button sx={{fontSize: "0.8rem"}} type="submit">Verify</Button>
                    </DialogActions>
                </Dialog>
                
            </>)
            }
      
            <ProgressComponent handleProgressBackToHome={handleProgressBackToHome} handleProgressClose={handleProgressClose} sendingToSigner={sendingToSigner} sendingToSocket={sendingToSocket} sentToSocket={sentToSocket}/>
          

            <CopyRight/>

        </Box>

    );
}
