import React, {useEffect} from 'react'
import {Box, IconButton,Card,Button, Typography, BottomNavigation, BottomNavigationAction, Paper} from "@mui/material"
function ScreenHeader({messageType}) {
    const messages ={ "start":{
        heading:"Welcome",
        description:"Click the [Let's Go] for configuration"
    },
    "certlist":{
        heading:"Select Certificate",
        description:"Following Certificates found in your system.Select the digital certificate to sign"
    },
    "certadd":{
        heading:"Add Certificate",
        description:"To add the Certificate\n 1. Enter pin code to proceed.\n 2. DSC Supplier can be contacted for identifying appropriate dll for your dsc.\n 3. The .dll file will be present in \"Windows\\SysWOW64 or \"Windows\\system32\""

    },
    "certview":{
        heading:"View Certificate",
        description:"To use the following Certificate click on [Proceed].In case you want to choose different certificate click [Back] and select the desired certificate from the list."},
    "application":{
        heading:"Application",
        description:"The following Application is connected to TCRS Digital Signer. You can Digitally sign the files from the connected Applications."
    },
    "readyToSign":{
        heading:"Ready To Sign",
        description:"The TCRS Digital Signer is all set to digitally sign the files. The details of the configurations set are shown below and will be used for signing."
    }
}
    useEffect(() => {
        console.log(messageType, messages[messageType])
    }, []);
  return (
    <Box  style={{display:"flex", flexDirection:"column",gap:"16px" , lineHeight:"42px"}}>
            <Typography sx={{fontSize:"34px",fontWeight:400,color:"rgba(0,0,0,0.87)"}}>
                {messages[messageType].heading}
            </Typography>
            <Typography sx={{fontSize:"16px",lineHeight:"24px",color:"rgba(0,0,0,0.6)",fontWeight:400, whiteSpace:"pre-wrap"}}>
               {messages[messageType].description}
            </Typography>
        </Box>
  )
}


export default ScreenHeader