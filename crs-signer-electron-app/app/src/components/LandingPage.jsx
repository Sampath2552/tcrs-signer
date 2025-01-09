import React from 'react'
import SidePanel from './SidePanel'
import CertificateList from './CertificateList'
import { Box } from '@mui/material'
import SignerSection from './SignerSection'
function LandingPage() {
  return (
    <Box sx={{  display:"flex" ,position:"relative",  height: "100vh"}}>
   
            <SidePanel/>
                {/* <CertificateList/> */}
            <SignerSection/>
        </Box>

    
  )
}

export default LandingPage