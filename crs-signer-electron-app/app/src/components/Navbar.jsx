import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import TimelineDot from '@mui/lab/TimelineDot';
import {useState,useEffect} from "react";
import PropTypes from 'prop-types';
let userDir = window.electron.homeDir().split("\\");
let userCompleteId = userDir[userDir.length - 1]
let userId = userCompleteId.replace("tcs",'').replace("v",'')
export default function Navbar({handleClickSettings}) {
    const [javaStatus,setJavaStatus] = useState(false)
    const handleClickLogout = () =>{
        console.log(`clicked on Logout button`);
    }
    const flag=1
    useEffect(()=>{
        window.electron.ipcRenderer.on("java-disconnected", () => {

            setJavaStatus(false)
          
        })
        window.electron.ipcRenderer.on("java-connected",()=>{
            setJavaStatus(true)
        })
    },[flag])

    return (
            <AppBar  sx={{position:"sticky", top: "0"}} color="primary">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "left" }}>
                        TCRS Signer
                    </Typography>
                    <Typography color="inherit" sx={{ mr: 2 }}>{userId}</Typography>
                    <TimelineDot style={{margin: '24px 0px 11.5px'}} color={(javaStatus===true)?"success":"error"}/>
                    <IconButton aria-label="Settings" sx={{ mr: 2 }} onClick={handleClickSettings}>
                        <SettingsIcon/>
                    </IconButton>
                    <IconButton aria-label="Logout" sx={{ mr: 2 }} onClick={handleClickLogout}>
                        <LogoutIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>
    );
}
