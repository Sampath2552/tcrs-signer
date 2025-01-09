import React from 'react'
import {
    
    Box
   
} from '@mui/material';
function ReportsList(responseList) {
    const reportList = responseList.reportList
  return (
    <Box display={"flex"} sx={{
        m: 3,
        p: 4,
        border: '1px solid black',
        borderRadius: 5,
        backgroundColor: "#E5E4E2",
        justifyContent: {xs: "space-between", md: "space-between", lg: "space-evenly"},
        overflow:"hidden"
    }}>
        {reportList!=null && reportList.length>0 && <>
        
                    {/* {   
                        reportList.map((report)=>{
                            return <h1 key> report</h1>
                        })
                    } */}


        
                        </>
        
        }
      
        </Box>
  )
}

export default ReportsList