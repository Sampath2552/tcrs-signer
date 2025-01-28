import {useState,useEffect} from 'react'
import * as React from 'react';
import {
    Box,

    Button,
    Typography,
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    Snackbar
} from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import ArticleIcon from "@mui/icons-material/Article"
import WifiIcon from "@mui/icons-material/Wifi"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import Fab from '@mui/material/Fab';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import ModeIcon from '@mui/icons-material/Mode';
import CloseIcon from '@mui/icons-material/Close';
import ScreenHeader from './ScreenHeader'
import CertificateList from './CertificateList'
import CertificateInfo from './CertificateInfo'
import ApplicationConnection from "./ApplicationConnection";
import Signer from "./Signer"
import PdfViewer from "./PDFViewer";
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import {Alert} from "@mui/lab";
import AddCertificate from "./AddCertificate";

function SignerSection() {
    const [snackOpen,setSnackOpen] = useState(false)
    const [snackMsg,setSnackMsg] = useState(null)
    const [messageType,setMessageType] = useState("start")
    const [certificateToBeUsed,setCertificateToBeUsed] = useState({})
    const [displayCertificateInfo,setDisplayCertificateInfo] = useState(false)
    const [renderPdf,setRenderPdf] = useState(false)
    const [displayLandingScreen,setDisplayLandingScreen] = useState(true)
    const [displayCertificateList,setDisplayCertificateList] = useState(false)
    const [displayApplicationScreen,setDisplayApplicationScreen] = useState(false)
    const [displaySigningScreen,setDisplaySigningScreen] = useState(false)
    const [isCertificateConfigured,setIsCertificateConfigured] = useState(false)
    const [isApplicationConnected,setIsApplicationConnected] = useState(false)
    const [pdfData,setPdfData] = useState(null)
    const [receivedData,setReceivedData] = useState({})
    const [crsLoggedInUserId,setCrsLoggedInUserId] = useState('')
    const [sentToCrs,setSentToCrs] = useState(false)
    const [sendingToSigner,setSendingToSigner] = useState(false)
    const [displayAddCertificateScreen, setDisplayAddCertificateScreen] = useState(false)
    const [certificatesList,setCertificatesList] = useState([])
    const [tokens,setTokens] = useState([])
    useEffect(()=>{
        window.electron.ipcRenderer.on("render-tokens", (response) => {
            console.log(JSON.stringify(response[0]))
            // window.alert(JSON.stringify(response[0]))
            if (response[0].status === '0') {
                if (response[0].stdout !== "0\r\n") {
                    console.log(response[0].stdout)
                    let tokens = response[0].stdout.split("0\r\n")

                    tokens.pop()
                    setTokens(tokens)

                }

            }

        })

        window.electron.ipcRenderer.on("show-dll-certificate", (response) => {

            closeAll()

            let cert = JSON.parse(response[0])
            setCertificatesList((prev)=>[...prev,cert])
            setMessageType("certview")
            setCertificateToBeUsed(JSON.parse(response[0]))
            setDisplayCertificateInfo(true)

        })

    },[1])

    const getCertificates = ()=>{

        window.signer.getCertificates()
    }

    useEffect(()=>{

        window.electron.ipcRenderer.on("show-certificates",(response)=>{

            response = JSON.parse(response[0])


            console.log("Response Received = "+response);
            if(response!=null && response.certs )
            {
                console.log("Certificates Received = "+response.certs)

                    setCertificatesList(response.certs)

                
            }
        })
    },[1])
    const closeAll=()=>{
        setDisplayApplicationScreen(false)
        setDisplayCertificateInfo(false)
        setDisplayCertificateList(false)
        setDisplayApplicationScreen(false)
        setDisplaySigningScreen(false)
        setDisplayLandingScreen(false)
        setDisplayAddCertificateScreen(false)
    }
    const navigateConnection =( connectionStatus) =>{
        if(connectionStatus)
        {   console.log(isApplicationConnected+""+isCertificateConfigured)
            if(isApplicationConnected && isCertificateConfigured)
            {   console.log("isCertificateConfigured ="+ isCertificateConfigured )

                openSigningScreen()
            }
        }
        else {
            closeAll()
            openApplicationScreen()
        }
    }
    const openCertificateList = ()=>{
        closeAll()
        setDisplayCertificateList(true)
        setMessageType("certlist")
    }
    const handleStart= ()=>{
        console.log("Handling Start")
       /* setHeading(messages["certlist"].heading)
        setDescription(messages["certlist"].description)*/
        setMessageType("certlist")
        setDisplayCertificateList(true)
        setDisplayLandingScreen(false)
        getCertificates()
    }
    const handleCertificateSelection = (certificate) =>{
        setCertificateToBeUsed(certificate)
        setDisplayCertificateList(false)
        setDisplayCertificateInfo(true)
        setMessageType("certview")
        console.log(certificate)

    }
    const openApplicationScreen = ()=>{
        closeAll()
        setDisplayApplicationScreen(true)
        setMessageType("application")
        setDisplayLandingScreen(false)
    }
    const handleBack = ()=>{
        setIsCertificateConfigured(false)
        localStorage.setItem("isCertificateConfigured","false")
        closeAll()
        setDisplayCertificateList(true)
        setMessageType("certlist")
    }
    const configureCertificate = ()=>{
        setIsCertificateConfigured(true)
        localStorage.setItem("isCertificateConfigured","true")
        setDisplayCertificateInfo(false)
        if(isApplicationConnected){
            setDisplaySigningScreen(true)
            setMessageType("readyToSign")
        }
        else {
           openApplicationScreen()
        }
    }
    const handleCertificateButtonClick = () =>{
    closeAll()

        if(isCertificateConfigured)
        {
            setDisplayCertificateInfo(true)
            setDisplayLandingScreen(false)
            setMessageType("certview")

        }
        else {
            setDisplayCertificateInfo(false)
            setDisplayCertificateList(true)
            setDisplayLandingScreen(false)
            setMessageType("certlist")
        }
    }
    const openSigningScreen = () =>{
        console.log("Opening Signing Screen")
        if(isCertificateConfigured && isApplicationConnected)
        {
            closeAll();
            setMessageType("readyToSign")
            setDisplaySigningScreen(true)

        }
    }
    const signPdf =()=>{

        const dataToSend = {
            ...receivedData,
            flagForSigning:"1",
            dllSigningFlag: certificateToBeUsed.fromDll ? "true":"false",
            multiSignFlag: "false",
            alias:certificateToBeUsed.alias,
            password: certificateToBeUsed.password ? certificateToBeUsed.password : "",

        }

        setSendingToSigner(true)
        window.signer.sendData( JSON.stringify(dataToSend))
    }
    const handleAddCertificateClick=()=>{
        closeAll()

        setDisplayAddCertificateScreen(true)
        setMessageType("certadd")

    }
    useEffect(()=>{
        localStorage.clear()
        window.electron.ipcRenderer.on("crs-connected", (response) => {
            setCrsLoggedInUserId('')

            setIsApplicationConnected(true)
            navigateConnection(true)

        })
        window.electron.ipcRenderer.on("invalid-user",(response)=>{
            setCrsLoggedInUserId(response[0])

            setIsApplicationConnected(false)
            navigateConnection(false)
            //window.alert(`crsLoggedInUserId=${crsLoggedInUserId}`)
        })

    window.electron.ipcRenderer.on("crs-disconnected", () => {
        setIsApplicationConnected(false)
        navigateConnection(false)
    })
        window.electron.ipcRenderer.on("render-pdf", (response) => {

            let dataObject = response[0]
            setReceivedData(dataObject)
            if(localStorage.getItem("isCertificateConfigured")==="false" || localStorage.getItem("isCertificateConfigured")===null)
            {
                openCertificateList()
                setSnackMsg({children:"Configure Certificate before trying to sign",severity:"error"})
                setSnackOpen(true)
            }
           // setCrsLoggedInUserId(dataObject.userId)
            setPdfData(dataObject.data)

            setRenderPdf(true)
            setSentToCrs(false)







        })
        window.electron.ipcRenderer.on("rerender-pdf", (response) => {
            let dataObject = response[0]

            setPdfData(dataObject.signedData)


        })
        window.electron.ipcRenderer.on("acknowledgement-received", (response) => {
            setSendingToSigner(false)
            setSentToCrs(true)
            setSnackOpen(true)
            setSnackMsg({children:"Signed Report Successfully Sent to CRS",severity:"success"})
        })
        window.electron.ipcRenderer.on("show-sign-status", (response) => {

            if(response[0]===null)
            {
                setSnackMsg({children:"Signing Failed.Please try again",
                                    severity:"error"})
                setSendingToSigner(false)
            }
            else
            {
                const header = response[0].header



                const description = response[0].description

                setSnackMsg({
                    children:description,
                    severity:"error"
                })
                setSnackOpen(true)
                setSendingToSigner(false)


            }

        })
    },[1])



  return (
    <Box 
    sx={{display:"flex",width:"712px",flexDirection:"column",gap:"20px",padding:"12px 64px"}}>
         <>
                <ScreenHeader messageType={messageType}/>

                <Box sx={{display:"flex",flexDirection:"column",width:"712px"}}>
                    <Box>
                        <Box sx={{width:"712px",height:"404px"}}>
                            {displayCertificateList && <CertificateList  handleAddCertificateClick={handleAddCertificateClick} handleCertificateSelection = {handleCertificateSelection} certificatesList={certificatesList} getCertificates={getCertificates}/>}
                            {displayCertificateInfo && (certificateToBeUsed!=null) && <CertificateInfo  certificate={certificateToBeUsed} configureCertificate={configureCertificate} handleBack={handleBack}/>}
                            {displayApplicationScreen && <ApplicationConnection crsLoggedInUserId={crsLoggedInUserId} /> }
                            {displayAddCertificateScreen && <AddCertificate handleBack={handleBack} tokens={tokens} handleAddCertificateClick={handleAddCertificateClick}/>}
                            {displaySigningScreen && <Signer isCertificateConfigured={isCertificateConfigured} isApplicationConnected={isApplicationConnected} crsLoggedInUserId={crsLoggedInUserId} certificateHolder={certificateToBeUsed.issuedTo}/>}
                        </Box>
                    </Box>
                    <Box sx={{marginTop:"12px",display:"flex",justifyContent:"center",alignItems:"center"}}>

                        {displayLandingScreen&&<Button sx={{position:"fixed"}} variant="contained" endIcon={<SendIcon/>} onClick={handleStart}>LET'S GO</Button>}

                    </Box>
                </Box>
            </>

        <Snackbar
            open={snackOpen}
            anchorOrigin={{vertical:'top',horizontal:'right'}}
            onClose={()=>{
                setSnackOpen(false)
                setSnackMsg(null)
            }}
            autoHideDuration={10000}
        >
            <Alert
                variant="filled"
                {...snackMsg}
                onClose={
                    ()=>{
                        setSnackOpen(false)
                        setSnackMsg(null)
                    }
                }
            />


        </Snackbar>



                        < >
                            <Box>
                                <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                                          open={sendingToSigner} >
                                    <CircularProgress/>
                                </Backdrop>
                            </Box>
                            <SwipeableDrawer
                                anchor="top"
                                open={renderPdf && isApplicationConnected && isCertificateConfigured }
                                onClose={()=>{setRenderPdf(false)}}
                                // onClose={toggleDrawer(anchor, false)}
                                // onOpen={toggleDrawer(anchor, true)}
                            >
                                <Snackbar
                                    open={snackOpen}
                                    anchorOrigin={{vertical:'top',horizontal:'right'}}
                                    onClose={()=>{
                                        setSnackOpen(false)
                                        setSnackMsg(null)
                                    }}
                                    autoHideDuration={10000}
                                >
                                    <Alert
                                        variant="filled"
                                        {...snackMsg}
                                        onClose={
                                            ()=>{
                                                setSnackOpen(false)
                                                setSnackMsg(null)
                                            }
                                        }
                                    />


                                </Snackbar>
                                <Typography sx={{fontSize:"28px",fontWeight:400,color:"rgba(0,0,0,0.87)",marginLeft:10}}> {sentToCrs ?  "Signing Complete" : "Sign"} </Typography>
                                <Typography sx={{fontSize:"16px",lineHeight:"24px",color:"rgba(0,0,0,0.87)",fontWeight:400,marginLeft:10, whiteSpace:"pre-wrap"}}>

                                    { sentToCrs ? `The ${receivedData.fileName} file is signed and sent to CRS application. ` : ` CRS Application is requesting to Digitally Sign  ${receivedData.fileName} file.` }

                                </Typography>
                                        <Box sx={{  msOverflowStyle:"none",scrollbarWidth:"none",overflowY:"scroll",marginLeft: 3,marginRight:3,marginTop:1,marginBottom:1, p: 2,paddingTop:0, overflow:"auto",  height:"75vh", borderRadius: 5, WebkitOverflowScrolling:"none" }}>

                                            {(pdfData!==null) ? (<PdfViewer pdfData={pdfData}/>) : ''}
                                            <Box sx={{position:"absolute",right:"85px",bottom:"16px",'& > :not(style)': { m: 1 }}} >
                                                {
                                                    sentToCrs===false ? (<>
                                                        <Fab  onClick={()=>{
                                                            setRenderPdf(false)
                                                        }}  size="medium"  aria-label="add">
                                                            <CloseIcon />
                                                        </Fab>
                                                        <Fab variant="extended" onClick={signPdf}  color="success"  size="medium"  aria-label="add">
                                                            <ModeIcon  sx={{ mr: 1 }} /> Sign
                                                        </Fab>
                                                    </>) : (
                                                        <>
                                                        <Fab  onClick={()=>{
                                                            setRenderPdf(false)
                                                        }}   color="error"  variant="extended" size="medium"  aria-label="add">
                                                            <CloseIcon sx={{ mr: 1 }} /> Close
                                                        </Fab>
                                                    </>)
                                                }

                                            </Box>
                                </Box>
                            </SwipeableDrawer>
                        </>







        <Paper sx={{display: "flex", bottom: 0, justifyContent: "center", alignItems: "center", width: "100%"}}
               elevation={3}>
            <BottomNavigation
                sx={{
                    bottom: 3,
                    position: "absolute",
                    gap: "24px",
                    display: "flex",
                    width:"60%",
                    justifyContent: "center",
                    alignItems: "center"
                }}
                showLabels
            >
                <BottomNavigationAction disabled={displayLandingScreen} label="Certificate" sx={{"color": displayLandingScreen ? "grey" : (isCertificateConfigured ? "green" : "red")}}
                                        onClick={handleCertificateButtonClick}
                                        icon={
                                            <ArticleIcon sx={{color:"error"}}/>
                }/>
                <BottomNavigationAction disabled={displayLandingScreen} label="Application" sx={{"color": displayLandingScreen ? "grey" : (isApplicationConnected ? "green":"red") }} onClick={openApplicationScreen} icon={<WifiIcon/>}/>
                <BottomNavigationAction disabled={displayLandingScreen} label="Ready To Sign" onClick={openSigningScreen}  sx={{"color": displayLandingScreen ? "grey" : ( isCertificateConfigured && isApplicationConnected ? "green":"red" )}} icon={<CheckCircleIcon/>}/>
            </BottomNavigation>
        </Paper>
       </Box>
    
 
  )
}

export default SignerSection