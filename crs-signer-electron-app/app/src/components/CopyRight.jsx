import React from 'react'
import Typography from '@mui/material/Typography';
import {
    
    Box
    
} from '@mui/material';
export default function CopyRight() {
  return (
    <Box sx={{
        position: "absolute",
        bottom: -15,
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#E5E4E2",
        width: 500,
        height: 30,
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center"
    }}>
        <Typography sx={{display: "inline-block"}}>{new Date().getFullYear()} © Tata Consultancy Services
            ltd</Typography>
        <Typography sx={{display: "inline-block"}}>Version 1.0</Typography>
    </Box>
  )
}
