import {Alert} from "@mui/lab";

import {Box, CardMedia, Typography} from "@mui/material";
import React from "react";

let userDir = window.electron.homeDir().split("\\");
let userCompleteId = userDir[userDir.length - 1]
let userId = userCompleteId.replace("tcs",'').replace("v",'')

const ApplicationConnection = ({crsLoggedInUserId})=>{
    const openCrs= ()=>{
        window.signer.openCrs()
    }
    console.log(crsLoggedInUserId)
    return (<>

        {(crsLoggedInUserId!=='' && (crsLoggedInUserId!==userId)) && <Alert severity="error">
            You have logged in as {userId} in TCRS and as {crsLoggedInUserId} in CRS . Please make sure that you have logged in with the same ID in both application
        </Alert>}
        <Typography sx={{fontSize:"16px",lineHeight:"24px",color:"rgba(0,0,0,0.6)",fontWeight:400, whiteSpace:"pre-wrap"}}>
            In case no application is listed below, go to connection section in the application and choose connect TCRS Digital Signer.
        </Typography>
        <Box sx={{display:"flex",justifyContent:"center",alignItems:"center",padding:"20px"}}>

            <CardMedia component="img" onClick={openCrs} image="./Assets/crsLogo.svg" sx={{height:"100px",width:"100px",cursor:'pointer'}} ></CardMedia>

        </Box>
    </>)
}
export default ApplicationConnection