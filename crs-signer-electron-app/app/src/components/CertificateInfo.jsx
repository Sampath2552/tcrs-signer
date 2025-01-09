import React from 'react'
import { TextField} from "@mui/material";
import Grid from '@mui/material/Grid2';
import Button from "@mui/material/Button";
import {ArrowForward, NavigateBefore} from "@mui/icons-material";
import {Alert} from "@mui/lab";

function CertificateInfo({certificate,configureCertificate,handleBack}) {
  return (
    <>
      {certificate!=null ? <>

        <Grid container spacing={2}>
          <Grid size={12}>
            { certificate.fromDll &&
                <Alert severity="success">Certificate added succesfully.</Alert>}
          </Grid>
        <Grid size={12}>

            <TextField
                id="outlined-read-only-input"
                label="Issued To"
                
                variant="filled"
                defaultValue={certificate.issuedTo}
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                sx={{width:"100%"}}
            />

        </Grid>
        <Grid size={12}>
          <TextField id="outlined-read-only-input"
                           label="Issued By"
                     variant="filled"
                     defaultValue={certificate.issuedBy}
                     sx={{width:"100%"}}
                     
                           slotProps={{
                             input: {
                               readOnly: true,
                             },
                           }}/>


        </Grid>
        <Grid size={6}>
          <TextField
              id="outlined-read-only-input"
              label="Serial Number"
              variant="filled"
              
              defaultValue={certificate.serialNo}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{width:"100%"}}
          />
        </Grid>
        <Grid size={6}>
          <TextField
              id="outlined-read-only-input"
              label="Expiration Date"
              variant="filled"
              
              defaultValue={certificate.expirationDate}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{width:"100%"}}
          />
        </Grid>
          <Grid size={12}>
            <TextField id="outlined-read-only-input"
                       label="Issuer Details"
                       variant="filled"
                       defaultValue={certificate.issuerDetails.replace(", ","\n")}
                       sx={{width:"100%",whiteSpace:"pre-wrap"}}

                       multiline={true}
                       slotProps={{
                         input: {
                           readOnly: true,
                         },
                       }}/>


          </Grid>
          <Button variant="contained" color="success" onClick={()=>{configureCertificate()}} startIcon={<ArrowForward/>}>Proceed</Button>
          <Button variant="contained" color="secondary" onClick={()=>{handleBack()}} startIcon={<NavigateBefore/>}>Back</Button>
      </Grid>
      </>:"Loading Certificate Details"}
    </>
  )
}

export default CertificateInfo