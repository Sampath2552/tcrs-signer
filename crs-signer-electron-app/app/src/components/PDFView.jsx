import * as React from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Navbar from "./Navbar";
import { styled } from '@mui/material/styles';
import {
    Divider,
    Box,
    List,
    ListItem,
    ListItemText,
    Container,
    TextField
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from "@mui/material/IconButton";
import UsbIcon from '@mui/icons-material/Usb';
import UsbOffIcon from '@mui/icons-material/UsbOff';
import { useState, useEffect } from "react";
import SignReadyStatus from "./SignReadyStatus";
import FileChangeCard from "./FileChangeCard";
import PopupModal from './PopupModal';
import ListItemButton from '@mui/material/ListItemButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PdfViewer from './PDFViewer';

let userDir = window.electron.homeDir().split("\\");
let userId = userDir[userDir.length - 1]

const PdfView = ({pdfData,role,changePdfScreenStatus,setOpenLoader,showSignButton,setShowSignButton,setSendingToSigner})=> {
    const [open, setOpen] = useState(false);
    const handleLoading = ()=>{
        setOpenLoader(true)
    }
    // const [pdfData,setPdfData] = useState('')
    const handleClickSettings = ()=>{

    }
    
    const sendData = (pwd)=>{
        let fileName = localStorage.getItem("fileName")
        let user ={
            flagForSigning:"1",
            userId: userId,
            data:pdfData,
            role:role,
            password: pwd,
            fileName:fileName
        }
        console.log(user)
        console.log(JSON.stringify(user))
        // changeSendingToSignerStatus();
        setSendingToSigner(true)
        window.signer.sendData( JSON.stringify(user))
    }
    const handlePwdDialogClickOpen = () => {
        setOpen(true);
    };

    const handlePdfViewPwdDialogClose = () => {
        setOpen(false);
        

    };
    const handleBackToHome = ()=>{
        changePdfScreenStatus()
        setShowSignButton(false)
    }
    const validatePassword = (password)=>{
             // let token = { userId: userId, password: pwd }
            // window.signer.sendData(token)
            let token = { userId: userId, password: password }
            handleLoading()
                        // window.alert(JSON.stringify(token))
            window.signer.checkToken(JSON.stringify(token))
           
    }

    const signPdf = () =>{
        let pwd = verifyPwdExistence()
        if(pwd!==null)
        {
            // let token = { userId: userId, password: pwd }
            // window.signer.sendData(token)
            
            sendData(pwd)
          
        }
        else{
                setOpen(true)
        }
       
    }
    const verifyPwdExistence=()=>{
        let password = localStorage.getItem("password");
        
        if(password!==null)
        {
            
            return password
        }
        else
        {
           
            return null
        }
    }
    useEffect(()=>{
        window.electron.ipcRenderer.on("valid-password",(response)=>{
            // let dataObject =response[0]
            
            // sessionStorage.setItem("password",dataObject.data)
            // signPdf()
          
        })
    },[])
  
    return (

        <Box sx={{  position:"relative",height:"50vh" }}>
       
           
         

            <Box sx={{  msOverflowStyle:"none",scrollbarWidth:"none",overflowY:"scroll",m: 3,marginBottom:1, p: 2, overflow:"auto", height:"65vh", border: '1px solid black', borderRadius: 5, backgroundColor: "#E5E4E2", WebkitOverflowScrolling:"none" }}>
               
                <Box sx={{height:"100%",width:"100%"}}>{(pdfData!==null) ? (<PdfViewer pdfData={pdfData}/>) : ''}</Box>
                
            </Box>

            <Box  sx ={{display:"flex",justifyContent:"center",gap:"20px"}}>
             
                {showSignButton ? ( <><Button sx={{ p: 1, paddingLeft: 2, paddingRight: 2, borderRadius: "25px", border: "1px solid #1976d2" }} onClick={() => { changePdfScreenStatus(); } }>Cancel</Button><Button sx={{ p: 1, paddingLeft: 3, paddingRight: 3, borderRadius: "25px", border: "1px solid black", color: 'white', backgroundColor: "#1976d2" }} onClick={() => { signPdf(); } }>Sign</Button></>
               ) 
                :
                 ( <Button sx= {{p:1,paddingLeft:2,paddingRight:2, borderRadius:"25px",border:"1px solid black",color:'white',backgroundColor:"#1976d2"}} onClick={()=>{handleBackToHome()}} >Back To Home</Button>)}
           
           
            </Box>
           
            <Dialog
                open={open}
                onClose={handlePdfViewPwdDialogClose}

                PaperProps={{
                    component: 'form',
                    sx: { borderRadius: 3 },
                    onSubmit: (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries(formData.entries());
                        const password = formJson.tokenpass;
                        handlePdfViewPwdDialogClose();
                        validatePassword(password)
                        // window.alert(JSON.stringify(token))
                       
                        
                    },
                }}
            >
                <DialogTitle sx={{ width:"30rem",marginBottom:3, fontSize: "1rem" , backgroundColor:"#1976d2" }}>Enter  Password</DialogTitle>

                <DialogContent>
                    <DialogContentText>The password will be stored in cache for 30mins</DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="tokenpass"
                        label="Password"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                     
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", display:"flex",gap:"10px" }}>
                    <Button sx={{ fontSize: "0.8rem",  p:1,paddingLeft:2,paddingRight:2, borderRadius:"25px",border:"1px solid #1976d2" }} onClick={handlePdfViewPwdDialogClose}>Cancel</Button>
                    <Button sx={{ fontSize: "0.8rem",p:1,paddingLeft:3,paddingRight:3, borderRadius:"25px",border:"1px solid black",color:'white',backgroundColor:"#1976d2" }} type="submit">Proceed</Button>
                </DialogActions>

            </Dialog>
            


               


        </Box>

    );
}

export default PdfView