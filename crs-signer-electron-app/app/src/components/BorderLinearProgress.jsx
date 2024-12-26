import React from 'react'
import {styled} from '@mui/material/styles';
import LinearProgress, {linearProgressClasses} from '@mui/material/LinearProgress';

const BorderLinearProgress = styled(LinearProgress)(({ theme, color }) => ({
        height: 40,
    borderRadius: 30,
    margin: 2,
    width: '75%',
    left: '12%',
    backgroundColor:"#f7bab5",
    border: `1px solid ${theme.palette.grey[300]}`,
    '& .MuiLinearProgress-bar': {
      borderRadius: 30,
      backgroundColor: color, // Dynamic color based on prop
    },
  }));
// const BorderLinearProgress = styled(LinearProgress)(({theme,color}) => ({
//     height: 40,
//     borderRadius: 30,
//     margin: 2,
//     width: '75%',
//     left: '12%',
//     // Background
//     [`&.${linearProgressClasses.colorPrimary}`]: {
//         background: 'black',
//         ...theme.applyStyles('dark', {
//             backgroundColor: theme.palette.grey[800],
//         }),
//     },
//     //Main
//     [`& .${linearProgressClasses.bar}`]: {
//         borderRadius: 30,
//         backgroundColor: color,
//         ...theme.applyStyles('dark', {
//             backgroundColor: '#308fe8',
//         }),
//     },
// }));
export default BorderLinearProgress