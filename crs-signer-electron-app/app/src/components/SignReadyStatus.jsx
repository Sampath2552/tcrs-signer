import {Box, Divider} from "@mui/material";
import Typography from "@mui/material/Typography";
import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import WifiTetheringOffIcon from '@mui/icons-material/WifiTetheringOff';
import * as React from "react";
import {useEffect} from "react";


export default function SignReadyStatus({ isCrsConnected,isTokenConfigured}){


    return (
        <Box sx={{position: "absolute", bottom: 0, width: 1}}>
            <Box align="left" sx={{px:2.5, pb:2, pt:0}}>
                <Typography variant="h6" align="left" color="#36454F" sx={{ fontWeight: 'bold', mt:2 }}>
                    Application
                </Typography>
                <Divider orientation="horizontal" flexItem color="#808080" sx={{ borderBottomWidth: 2 }} />
                <Box display={"flex"} justifyContent={"space-between"} sx={{mt: 1.2}}>
                    {
                        isCrsConnected ? (
                            <>
                            <Typography fontSize={16} color="#36454F"  pt={1} >
                                Connected to CRS
                            </Typography>
                            <WifiTetheringIcon sx={{ color:"green",fontSize: "30px"}}/>
                            </>
                            ) :
                        (
                            <>
                            <Typography fontSize={16} color="#36454F"  pt={1} >
                            Waiting to connect to CRS
                            </Typography>
                            <WifiTetheringOffIcon sx={{ color:"red",fontSize: "30px"}}/>
                            </>
                        )
                    }


                </Box>
            </Box>
            <Box sx={{height: 60, px:5, pt: 2, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, backgroundColor: "#48d1cc", display: "flex", justifyContent: "space-between"}}>

                {/*{*/}
                {/*    status==="ready"?(*/}
                {/*        <>*/}
                {/*            <Typography align="left" color="#36454F" sx={{ fontSize: "1.4em", fontWeight: 'bold', pt: 1.2}}>*/}
                {/*                Ready to Sign*/}
                {/*            </Typography>*/}
                {/*            <CheckCircleIcon sx={{fontSize: "45px"}}/>*/}
                {/*        </>*/}
                {/*    ) :*/}
                {/*    status==="waiting"?(*/}
                {/*        <>*/}
                {/*    <Typography align="left" color="#36454F" sx={{fontSize: "1.33em", fontWeight: 'bold', pt: 1.2}}>*/}
                {/*    Waiting to Sign*/}
                {/*    </Typography>*/}
                {/*    <HourglassBottomIcon sx={{fontSize: "45px"}}/>*/}
                {/*        </>*/}
                {/*):(*/}
                {/*        <>*/}
                {/*            <Typography align="left" color="#36454F" sx={{fontSize: "1.4em", fontWeight: 'bold', pt: 1.2}}>*/}
                {/*                Not Ready*/}
                {/*            </Typography>*/}
                {/*            <CancelIcon sx={{fontSize: "45px"}}/>*/}
                {/*        </>*/}
                {/*)*/}
                {/*}*/}

                {
                    isCrsConnected && isTokenConfigured ?(
                        <>
                        <Typography align="left" color="#36454F" sx={{ fontSize: "1.4em", fontWeight: 'bold', pt: 1.2}}>
                            Ready to Sign
                        </Typography>
                        <CheckCircleIcon sx={{fontSize: "45px"}}/>
                        </>
                        ) : (
                            <>
                                <Typography align="left" color="#36454F" sx={{fontSize: "1.33em", fontWeight: 'bold', pt: 1.2}}>
                                    Cannot Sign
                                </Typography>
                                <CancelIcon sx={{fontSize: "45px"}}/>
                            </>
                    )
                }


            </Box>


        </Box>
    )
}


