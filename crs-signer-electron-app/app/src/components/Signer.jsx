import {Alert} from "@mui/lab";
import {Avatar, Badge, Box, CardHeader, CardMedia, Icon} from "@mui/material";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import PersonIcon from '@mui/icons-material/Person';
import Typography from "@mui/material/Typography";
import Grid from '@mui/material/Grid2';
import {deepOrange, green} from '@mui/material/colors';
import CardContent from "@mui/material/CardContent";
import {styled} from '@mui/material/styles';
import ArticleIcon from "@mui/icons-material/Article"
import WifiIcon from "@mui/icons-material/Wifi"

const StyledBadge = styled(Badge)(({theme}) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));
let userDir = window.electron.homeDir().split("\\");
let userCompleteId = userDir[userDir.length - 1]
let userId = userCompleteId.replace("tcs", '').replace("v", '')
const Signer = ({isApplicationConnected, isCertificateConfigured, crsLoggedInUserId, certificateHolder}) => {

    return (
        <>

            <Alert severity="warning" sx={{marginBottom: "10px"}}>Avoid detaching the DSC token or closing the browser
                until signing is completed.</Alert>
            {/*{crsLoggedInUserId!==userId && <Alert severity="error"> You have logged in as {userId} in TCRS and as {crsLoggedInUserId}. Please make sure that you have logged in with the same ID in both application </Alert>}*/}
            <Box>
                <Grid container spacing={2} >

                    <Grid size={4}>
                        <Card >

                            <Paper sx={{padding: "16px", height:100}} elevation={5}> <CardMedia sx={{display: "flex", gap: "20px"}}>

                                <StyledBadge
                                    overlap="circular"
                                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                    variant="dot"
                                >
                                    <Avatar sx={{bgcolor: green[500]}}>
                                        <PersonIcon></PersonIcon>
                                    </Avatar>
                                </StyledBadge>
                                <Typography sx={{fontWeight: "medium", fontSize: "1rem", color: "#rgba(0,0,0,0.87)"}}>
                                    {userId}
                                </Typography>
                            </CardMedia></Paper>

                        </Card>
                    </Grid>
                    <Grid size={4}>
                        <Card >

                            <Paper sx={{padding: "16px", height:100}} elevation={5}>
                                <CardMedia sx={{display: "flex", gap: "16px"}}>

                                    <Grid container >
                                        <Grid size={4}>
                                            <StyledBadge
                                                overlap="circular"
                                                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                                variant="dot"
                                            >
                                                <Avatar sx={{bgcolor: green[500]}}>
                                                    <ArticleIcon></ArticleIcon>
                                                </Avatar>
                                            </StyledBadge>

                                        </Grid>
                                        <Grid size={8}>
                                            <Typography sx={{
                                                fontWeight: "medium",
                                                fontSize: "1rem",
                                                color: "#rgba(0,0,0,0.87)"
                                            }}>
                                                {certificateHolder}
                                            </Typography>
                                        </Grid>

                                    </Grid>


                                </CardMedia>
                            </Paper>

                        </Card>
                    </Grid>
                    <Grid size={4}>
                        <Card >

                            <Paper sx={{padding: "16px", height:100}} elevation={5}>
                                <CardMedia sx={{display: "flex", gap: "20px"}}>
                                <StyledBadge
                                    overlap="circular"
                                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                    variant="dot"
                                >
                                    <Avatar sx={{bgcolor: green[500]}}>
                                        <WifiIcon></WifiIcon>
                                    </Avatar>
                                </StyledBadge>
                                <Typography sx={{fontWeight: "medium", fontSize: "1rem", color: "#rgba(0,0,0,0.87)"}}>
                                    CRS
                                </Typography>
                            </CardMedia></Paper>

                        </Card>
                    </Grid>
                </Grid>


                <Alert sx={{marginTop: 1}} severity="info">Go to application to initiate Sign the required file/s
                    .</Alert>


            </Box>

        </>
    )

}
export default Signer