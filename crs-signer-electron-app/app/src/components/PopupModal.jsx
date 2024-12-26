// import * as React from 'react';
// import { useState } from "react";
// import Backdrop from '@mui/material/Backdrop';
// import Box from '@mui/material/Box';
// import Modal from '@mui/material/Modal';
// import Fade from '@mui/material/Fade';
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';

// const style = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: "12rem",
//   bgcolor: 'background.paper',
//   // border: '1px solid #000',
//   borderRadius: 3,
//   boxShadow: 24,
//   p: 3,
// };

// export default function PopupModal({title, description, popupOpen, setPopupOpen}) {
//   const handleOpenPopup = () => setPopupOpen(true);
//   const handleClosePopup = () => setPopupOpen(false);

//   return (
//     <div>
//       <Modal
//         open={popupOpen}
//         onClose={handleClosePopup}
//         closeAfterTransition
//         slots={{ backdrop: Backdrop }}
//         slotProps={{  
//           backdrop: {
//             timeout: 500,
//           },
//         }}
//       >
//         <Fade in={popupOpen}>
//           <Box sx={style}>
//             <Typography id="transition-modal-title" variant="h6" component="h2">
//               {title}
//             </Typography>
//             <Typography id="transition-modal-description" sx={{ mt: 2 }}>
//               {description}
//             </Typography>
//           </Box>
//         </Fade>
//       </Modal>
//     </div>
//   );
// }


import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function PopupModal({title, description, description1, popupOpen, setPopupOpen}) {


 
  const handleClose = () => {
    setPopupOpen(false);
  };

  return (
    <React.Fragment sx={{display:'flex',justifyContent:'center',alignItems:'center'}}>
      
      <BootstrapDialog
        // sx={{width:'40%'}}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={popupOpen}
      >
        <DialogTitle sx={{ m: 0, p: 2  }} id="customized-dialog-title">
          {title}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],

          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Typography gutterBottom>
              {description}
              <br/>
              {description1}
          </Typography>
         
        </DialogContent>
       
      </BootstrapDialog>
    </React.Fragment>
  );
}

