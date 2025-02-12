import Grid from "@mui/material/Grid2";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Button,
    Select,
    TextField,
    Box,
    OutlinedInput,
    Snackbar
} from "@mui/material";
import {useEffect, useState} from "react";
import ArrowDropDownCircleIcon from "@mui/icons-material/ArrowDropDownCircle";
import * as React from "react";
import Typography from "@mui/material/Typography";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import CheckIcon from "@mui/icons-material/Check";
import {Alert} from "@mui/lab";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";

const AddCertificate = ({handleBack,tokens,setTokens})=>{
    const [showPassword, setShowPassword] = React.useState(false);
    const [selectedToken,setSelectedToken] = useState('')
    const [selectedFilePath, setSelectedFilePath] = useState('');
    const [password,setPassword] = useState('')
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const [slotIndex,setSlotIndex] = useState(0)
    const [snackOpen,setSnackOpen] = useState(false)
    const [snackMsg,setSnackMsg] = useState({})

    const handleChangePassword = (e)=>{
        setPassword(e.target.value)
    }
    const refreshTokens = () => {
        setTokens([])
        window.signer.refreshTokens()
        // setRefreshingTokens(true)

    }
    const handleChange = (e)=>{

        setSelectedToken(e.target.value.split("~")[0]);
        setSlotIndex(parseInt(e.target.value.split("~")[1])+1);

    }
    const openFilePicker = () => {
        console.log("Inside DP");

        window.signer.openFilePicker()
    }
    const checkDll=()=>{
        if(password==='' || selectedFilePath==='' || selectedToken==='' )
        {
            setSnackOpen(true)
            setSnackMsg({
                children:"Fill all the Details",
                severity:"error"
            })

        }
        else {
            setSnackOpen(false)
            window.signer.configureNewToken(
                {
                    selectedToken:selectedToken,
                    selectedFilePath:selectedFilePath,
                    slotIndex:slotIndex,
                    password: password
                }
            )
        }
    }
    useEffect(()=>{
        window.electron.ipcRenderer.on("selected-file", (selectedFile) => {

            setSelectedFilePath(selectedFile[0])

        })
        window.electron.ipcRenderer.on("show-configuration-status", (response) => {
            console.log(response[0])
            if(response[0]===null)
            {
                // setSnackMsg({children:"Signing Failed.Please try again",
                //     severity:"error"})
                // setSendingToSigner(false)
            }
            else
            {


                const description = response[0].description
                console.log(description)

                setSnackMsg({
                    children:description,
                    severity:"error"
                })
                setSnackOpen(true)
                // setSendingToSigner(false)


            }

        })
        window.electron.ipcRenderer.on("render-tokens", (response) => {
            console.log(JSON.stringify(response[0]))

                //setRefreshingTokens(false)

            // window.alert(JSON.stringify(response[0]))
            if (response[0].status === '0') {
                if (response[0].stdout !== "0\r\n") {
                    console.log(response[0].stdout)
                    let tokens = response[0].stdout.split("0\r\n")

                    tokens.pop()
                    setTokens(tokens)

                }

            }

        })
    },[1])
    return (
        <>
            {/*<Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}*/}
            {/*          open={refreshingTokens} >*/}
            {/*    <CircularProgress/>*/}
            {/*</Backdrop>*/}
        <Grid container spacing = {2}>
            <Button variant="contained" startIcon={<AutorenewIcon/>} onClick={refreshTokens}> Refresh</Button>
            <Grid size={12}>
               <FormControl fullWidth>
                   <InputLabel id ="token-dropdown">Select Token</InputLabel>
                   <Select
                       labelId="token-dropdown"
                       id="demo-simple-select"

                       label="Select Token"
                       onChange={handleChange}
                   >
                       {tokens.length===0 && <MenuItem>
                           No Tokens found
                       </MenuItem>}
                       {tokens.map((name, index) => (
                           <MenuItem
                               key={name}
                               value={name+"~"+index}
                           >
                               {name}
                           </MenuItem>
                       ))}

                   </Select>
               </FormControl>
            </Grid>
            <Grid size={4}>
                <FormControl fullWidth  variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">Token Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={
                                        showPassword ? 'hide the password' : 'display the password'
                                    }
                                    onClick={handleClickShowPassword}

                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        onBlur={handleChangePassword}
                        label="Token Password"
                    />
                </FormControl>
            </Grid>
            <Grid size={8}>

                <FormControl variant="outlined" sx={{width:'100%'}}>
                    <InputLabel htmlFor="outlined-adornment-file">.dll File Path</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-file"
                        type= 'text'
                        value= {selectedFilePath}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton

                                    onClick={openFilePicker}

                                    edge="end"
                                >
                                    <FolderOpenIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                        label=".dll File path"
                    />
                </FormControl>


            </Grid>

            <Grid size={4}>
                <Button
                    variant="contained"
                    onClick={checkDll}
                    color="success"
                    startIcon={<CheckIcon/>}
                >Save</Button>
                &nbsp;
                <Button
                    variant="contained" onClick={()=>{
                        handleBack()
                }}
                   startIcon={<CloseIcon/>}
                    color="error">
                    Cancel
                </Button>
            </Grid>
        </Grid>

            {snackOpen && <Alert
                sx={{marginTop:1}}
                variant="filled"
                {...snackMsg}
                onClose={
                    ()=>{
                        setSnackOpen(false)
                        setSnackMsg(null)
                    }
                }
            />
            }

        </>
    )
}
export default AddCertificate