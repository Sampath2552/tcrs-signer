import { Box, Divider, FormControl, MenuItem, Select } from "@mui/material";
import Typography from "@mui/material/Typography";
import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import CardContent from "@mui/material/CardContent";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";
import Button from "@mui/material/Button";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import Card from "@mui/material/Card";
// import HomePage from ""

const certifyingAuthorities = ["eMudhra","SafeNet","Gemalto 32 Bit","Gemalto 64 Bit","ePass","SafeSign","Trust Key","Belgium eiD MiddleWare","Aladin eToken","Safe net I key","StarKey","Watchdata PROXkey","mToken","HYPERSEC"];



export default function FileChangeCard({setOpenLoader,selectedTokenName,configureNewToken}) {

    const [certifyingAuthority, setCertifyingAuthority] = useState('eMudra');
    const [selectedFilePath, setSelectedFilePath] = useState('');

   

    const handleAuthorityChange = (e) => {
        setCertifyingAuthority(e.target.value);
    };

   

    const handleClickSaveButton = () => {
        const inputData = { certifyingAuthority, selectedFilePath };
        setOpenLoader(true)
        console.log(`clicked on save!! Input data:${JSON.stringify(inputData)}`);
        configureNewToken(inputData)
       
    }

    useEffect(()=>{
        window.electron.ipcRenderer.on("selected-file", (selectedFile) => {

            setSelectedFilePath(selectedFile[0])
        })
        
    })
    const openFilePicker = () => {
        console.log("Inside DP");
        
        window.signer.openFilePicker()
    }
    return (

        <CardContent >
                  
            <Box sx={{ color: "#808080", mb: "0.5rem" }}>

                <Typography align="left" color="#36454F" sx={{ fontWeight: 'bold', fontSize: "1.2rem" }}>
                    Choose DSC Token driver library
                </Typography>
                <Divider orientation="horizontal" flexItem color="#808080" sx={{ borderBottomWidth: 1.5 }} />


                <FormControl sx={{ mt: "0.8rem", width: 1 }}>
                    <Typography fontSize={"1rem"} align="left" color="#36454F">
                        Select Certifying Authority (CA)/DSC token issuer
                    </Typography>
                    <Select
                        labelId="select-certifying-authority"
                        id="select-certifying-authority"
                        value={selectedTokenName}
                        onChange={handleAuthorityChange}
                        IconComponent={ArrowDropDownCircleIcon}
                        disabled
                        sx={{
                            textAlign: "left",
                            width: 1,
                           
                            boxShadow: "none",
                            ".MuiOutlinedInput-notchedOutline": { border: 0 },
                            "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                            {
                                border: 0,
                            },
                            "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                                border: 0,
                            },

                        }}
                    >
                        {/* {certifyingAuthorities.map((name) => (
                            <MenuItem
                                key={name}
                                value={name}
                            >
                                {name}
                            </MenuItem>
                        ))} */}
                        <MenuItem key={selectedTokenName} value={selectedTokenName}>
                                {selectedTokenName}
                        </MenuItem>
                    </Select>

                    <Typography fontSize={"1rem"} align="left" color="#36454F">
                        Browse driver path (.dll file)
                    </Typography>

                    <Box display={"flex"} justifyContent={"space-between"} backgroundColor={"#D3D3D3"} sx={{height: "2rem"}}>

                        <Typography sx={{ display: 'inline', ml: 1, pt: 0.5, fontSize: "0.8rem"}}>
                            {selectedFilePath || "No file selected"}
                        </Typography>

                        <input
                            type="file"
                            accept=".dll"
                            // ref={fileInputRef}
                            // onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                        <Button onClick={() => openFilePicker()} startIcon={<FolderOpenIcon sx={{ color: "black", width: 35, height: 35 }} />}></Button>
                    </Box>
                    <Box textAlign={"left"} sx={{ mt: 2, width: 1 }}>
                        <Typography align="left" color="#36454F" sx={{ fontSize: "1rem", fontWeight: 'bold' }}>Note:</Typography>
                        <Typography sx={{fontSize: "0.8rem"}}>1. DSC supplier can be contacted for identifying appropriate dll for your dsc.</Typography>
                        <Typography sx={{fontSize: "0.8rem"}}>2. The file will be in "Windows\SysWOW64" or "WINDOWS\system32" or "WINNT\system32".</Typography>
                    </Box>

                    <Box sx={{ width: 1, display: "flex", justifyContent: "center", mt: 2 }}>
                        <Button variant="contained" sx={{ borderRadius: 50, px: 1.5, height: 22, fontSize: 12}} onClick={handleClickSaveButton}>
                            Save
                        </Button>
                    </Box>

                </FormControl>


            </Box>
        </CardContent>

    )
}


