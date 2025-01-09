import { Box, Typography,CardMedia } from '@mui/material'
import React from 'react'

function SidePanel() {
  return (
        <Box sx={{height:"100vh", display:"flex" , flexDirection:"column", backgroundColor:"rgba(0,0,0,0.08)",width:"450px" , justifyContent:"space-between"}}>
            <Box sx={{display:"flex", marginTop:"30px",padding:"20px"}}>
            <CardMedia component="img" image="./Assets/ready.svg" sx={{width:122,height:104}}></CardMedia>
            <Typography
                variant="h3"
                gutterBottom
            >
                TCRS Digital Signer
                </Typography>
            </Box>
            <footer style={{display:"flex",justifyContent:"space-between",padding:20}}>
                    <Typography>© tcs.com</Typography>
                    <Typography>TCRS Digital Signer v1.0.0</Typography>
            </footer>
        </Box>
  )
}

export default SidePanel