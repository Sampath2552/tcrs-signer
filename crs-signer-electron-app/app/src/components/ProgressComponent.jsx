import React from 'react'
import CancelIcon from '@mui/icons-material/Cancel';
import {IconButton, Typography,Button} from '@mui/material/';
import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Box}from '@mui/material/';
import BorderLinearProgress from './BorderLinearProgress';
import { useState } from 'react';
function ProgressComponent({handleProgressBackToHome,sendingToSigner,sendingToSocket,sentToSocket,handleProgressClose}) {
    
 
  
    const [progress, setProgress] = useState(0); // Controls the progress
  const [color, setColor] = useState('');   // Controls the bar color

  // React.useEffect(() => {
  //   setProgress(0)
  //   const timer = setInterval(() => {
  //     setProgress((prevProgress) => (prevProgress >= 90 ? 90 : prevProgress + 5));
  //   }, 800);
  //   return () => {
  //     clearInterval(timer)
  //     setProgress(0);
  //   };
  // }, [sendingToSigner,sendingToSocket]);
  
    React.useEffect(()=>{
        if(sendingToSigner)
        {
            setColor('#ed4a3b')
        }
        if(sendingToSocket)
        {
            setColor('#a30e02');
        }
        
    },[sendingToSigner,sendingToSocket])

  // React.useEffect(() => {

  //     setProgress(0)
  
  //     let progressValue = 0;
  //     const interval = setInterval(() => {
  //       progressValue += 1;
  //       setProgress((prev) => (prev < 90 ? progressValue : 90)); // Stop at 90%
  //       if (progressValue >= 90) clearInterval(interval);
  //     }, 50);
    
  // }, [sendingToSigner,sendingToSocket]);

  return (
    <Dialog
    open={sendingToSigner
        || sendingToSocket || sentToSocket
}>
    <DialogTitle sx={{width: "30rem", color:"#FFFFFF", marginBottom: 3, display:"flex",justifyContent:"space-between", fontSize: "1rem", backgroundColor: "#1976d2"}}>

        {sendingToSigner ? "Wait! Do not close" : (sendingToSocket ? "Wait! Almost Done" : "")}
        <Typography sx={{mt:1}}>{sentToSocket? "Sent To CRS":""}</Typography>
        {sentToSocket? (<IconButton onClick={()=>{handleProgressClose()}}><CancelIcon/></IconButton>):''}
    </DialogTitle>
    <DialogContent>
        <DialogContentText sx={{marginBottom: 2}}>
            {sendingToSigner ? "Your report is being signed securely" : (sendingToSocket ? "Signed report being sent to CRS." : "")}
            {sentToSocket ? "Your report is successfully sent to CRS." : ""}
        </DialogContentText>
        { ( sendingToSigner || sendingToSocket) ? (<BorderLinearProgress sx={{justifyContent: 'center'}}  color={color} value={progress}/>):''}
       
       
        { sentToSocket ?
         (<Box sx={{ justifyContent: "center", display:"flex" }}><Button 
            variant='contained'
            sx={{fontSize: "0.8rem",  p:1.5,paddingLeft:3,paddingRight:3, borderRadius:"25px",border:"1px solid #1976d2"}} 
            onClick={()=>{handleProgressBackToHome()

            }}> Back To Home</Button></Box>):''}
        <DialogContentText sx={{marginTop: 2}}>Signed report {sentToSocket ? "is" : "to be"} saved at
            Downloads\CRS\</DialogContentText>
    </DialogContent>
</Dialog>
  )
}

export default ProgressComponent