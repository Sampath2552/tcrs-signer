import {Box, Typography, CardMedia} from '@mui/material'
import React, {useEffect, useState} from 'react'
import TimelineDot from "@mui/lab/TimelineDot";

function SidePanel() {
    const [javaStatus,setJavaStatus] = useState(false)
    useEffect(()=>{
        window.electron.ipcRenderer.on("java-disconnected", () => {

            setJavaStatus(false)

        })
        window.electron.ipcRenderer.on("java-connected",()=>{
            setJavaStatus(true)
        })
    },[1])
    return (
        <Box sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(0,0,0,0.08)",
            width: "450px",
            justifyContent: "space-between"
        }}>
            <Box sx={{display: "flex", marginTop: "30px", padding: "20px"}}>
                <CardMedia component="img" image="./Assets/appLogo.svg" sx={{width: 140, height: 150}}></CardMedia>
                <Typography
                    variant="h3"
                    gutterBottom
                    sx={{fontSize: "50ox",marginTop: '20px',marginBottom:'0px',marginLeft:'15px',marginRight:'0px'}}
                >
                    CRS Digital Signer

                </Typography>
            </Box>

            <footer style={{ padding: 20}}>
                <Box sx={{display: "flex", justifyContent: "space-between"}}>
                    <Typography>© tcs.com</Typography>
                    <Typography>CRS Digital Signer v1.0.0</Typography>
                </Box>
                <Typography sx={{textAlign: "center", color: "rgba(0,0,0,0.6)"}}>Licensed to State Bank Of India</Typography>
            </footer>

        </Box>
    )
}

export default SidePanel