import React, {useEffect} from 'react'
import {Box, IconButton,Card,Button, Typography, BottomNavigation, BottomNavigationAction, Paper} from "@mui/material"
function ScreenHeader({messageType}) {
    const messages ={ "start":{
        heading:"Welcome",
        description:"Click the [Let's Go] for configuration"
    },
        "certlist":{
            heading:"Select Certificate",
            description:"Ensure DSC Token is plugged into the machine. Click refresh after insertion or removal of token."
        },
    "certlistFallback":{
        heading:"Select Certificate",
        description:"Following Certificates found in your system.Select the digital certificate to sign."
    },
    "certadd":{
        heading:"Add Certificate",
        description:"To add the Certificate\n 1. Ensure DSC Token is inserted into the machine.\n 2. Click refresh after insertion or removal of token. \n 3. Ensure respective DSC Token driver is installed in the machine. \n 4. Select the token from the dropdown. \n 5. Enter DSC Token Password \n 6. Select the correct .dll file from the machine. Please refer below instructions to identify the .dll file. \n\t ● DSC Supplier can be contacted for identifying appropriate dll for your dsc. \n\t ● The .dll file will be present in \"Windows\\SysWOW64 or \"Windows\\system32\" \n 7. Click Save   "

    },
    "certview":{
        heading:"View Certificate",
        description:"To use the following Certificate click on [Proceed].In case you want to choose different certificate click [Back] and select the desired certificate from the list."},
    "application":{
        heading:"Application",
        description:"You can Digitally sign the files from the connected Applications."
    },
    "readyToSign":{
        heading:"Ready To Sign",
        description:"The CRS Digital Signer is all set to digitally sign the files. The details of the configurations set are shown below and will be used for signing."
    }
}
    useEffect(() => {
        console.log(messageType, messages[messageType])
    }, []);
  return (
    <Box  style={{display:"flex", flexDirection:"column",gap:"16px" , lineHeight:"42px"}}>
            <Typography sx={{fontSize:"36px",fontWeight:400,color:"rgba(0,0,0,0.87)"}}>
                {messages[messageType].heading}
            </Typography>
            <Typography sx={{fontSize:"18px",lineHeight:"24px",color:"rgba(0,0,0,0.6)",fontWeight:400, whiteSpace:"pre-wrap"}}>
               {messages[messageType].description}
            </Typography>
        </Box>
  )
}


export default ScreenHeader