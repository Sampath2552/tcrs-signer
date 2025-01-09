
import React, { useEffect, useState } from 'react'
import { Box,Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import usbIcon from "../Asset/usb.png"
import usbDriveIcon from "../Asset/usb-drive.png"


function CertificateList({handleCertificateSelection,handleAddCertificateClick,certificatesList,getCertificates}) {


    useEffect(()=>{

        console.log(certificatesList)
    },[1])


  return (
       <Box sx={{}}>
         
             <Button variant="contained" startIcon={<AutorenewIcon/>} onClick={()=>{getCertificates()}} sx={{marginBottom:"8px"}}> Refresh </Button>
                <CertificateTable certificatesList={certificatesList} handleCertificateSelection={handleCertificateSelection}/>
            <Typography sx={{marginTop:"12px",marginBottom:"12px"}}>
                In case your certificate is not listed above click on [Add] to add manually.
            </Typography>
             <Button variant="contained" endIcon={<AddIcon/>} color='error' onClick={()=>{
                 console.log("Add Button Clicked")
                 handleAddCertificateClick()
             }} > ADD </Button>
        
       </Box>
  )

}
const CertificateTable = ({certificatesList,handleCertificateSelection})=>{

const handleRowSelection = (selectedItem) =>{
    console.log(selectedItem)
    if(selectedItem.row.validity)
    {
        handleCertificateSelection(selectedItem.row)
    }
    //window.alert(selectedItem)

}

const columns = [
    
  { field: 'issuedTo',
      headerName: 'Issued To',
      width: 150,
        renderCell: (params)=>{
                console.log(params)
                return (
                    <Box>
                        <img src={params.row.fromDll ? usbIcon : usbDriveIcon} height='16px' width='16px'  alt="usbicon"/> {params.row.issuedTo}
                    </Box>
                )
        }
  },
  {
    field: 'issuedBy',
    headerName: 'Issued By',
    width: 200,
  },
  {
    field: 'serialNo',
    headerName: 'Serial No',
    width: 150,

  },
  {
    field: 'expirationDate',
    headerName: 'Expiry Date',
    
    width: 110,

  },
    {
        field:"validity",
        headerName: "Is Valid",
        width: "100",
        renderCell : (params)=>{
            return  params.row.validity ? <CheckCircleTwoToneIcon sx={{color:"green",marginTop:1.5}}/> : <CancelTwoToneIcon sx={{color:"red",marginTop:1.5}}/>
        }
    }
  
];




  return (
    <Box sx={{ height: 300, width: '100%' }}>
      <DataGrid
        rows={certificatesList}
        columns={columns}
        isRowSelectable={(params) => params.row.validity }
        onRowClick={handleRowSelection}
        getRowId={(row)=>row.alias}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        sx={{
            '& .flaggedRow': {
                "backgroundColor":"#FFEEEE",

                "cursor":"not-allowed",
                "&:hover": {
                    "backgroundColor":"#FFEEEE"

                }

            }
        }}
        pageSizeOptions={[5]}
        getRowClassName={(params)=>{
           return  params.row.validity ? "" : "flaggedRow"
        }}
        
      />
    </Box>
  );
}

export default CertificateList


  
  
  
// function EnhancedTable() {
//     const [order, setOrder] = React.useState('asc');
//     const [orderBy, setOrderBy] = React.useState('calories');
//     const [selected, setSelected] = React.useState([]);
//     const [page, setPage] = React.useState(0);
//     const [dense, setDense] = React.useState(false);
//     const [rowsPerPage, setRowsPerPage] = React.useState(5);
  
//     const handleRequestSort = (event, property) => {
//       const isAsc = orderBy === property && order === 'asc';
//       setOrder(isAsc ? 'desc' : 'asc');
//       setOrderBy(property);
//     };
  
//     const handleSelectAllClick = (event) => {
//       if (event.target.checked) {
//         const newSelected = rows.map((n) => n.id);
//         setSelected(newSelected);
//         return;
//       }
//       setSelected([]);
//     };
  
//     const handleClick = (event, id) => {
//       const selectedIndex = selected.indexOf(id);
//       let newSelected = [];
  
//       if (selectedIndex === -1) {
//         newSelected = newSelected.concat(selected, id);
//       } else if (selectedIndex === 0) {
//         newSelected = newSelected.concat(selected.slice(1));
//       } else if (selectedIndex === selected.length - 1) {
//         newSelected = newSelected.concat(selected.slice(0, -1));
//       } else if (selectedIndex > 0) {
//         newSelected = newSelected.concat(
//           selected.slice(0, selectedIndex),
//           selected.slice(selectedIndex + 1),
//         );
//       }
//       setSelected(newSelected);
//     };
  
  
  
//     // Avoid a layout jump when reaching the last page with empty rows.
   
  
//     return (
//       <Box sx={{ overflow:"hidden", height:"300px" ,  }}>
//         <Paper elevation={3} sx={{  mb: 2, height:"300px" } }>
      
//           <TableContainer>
//             <Table
//                stickyHeader 
//               sx={{ minWidth: 750,height:"300px"  }}
//               aria-labelledby="sticky table"
//               size={dense ? 'small' : 'medium'}
//             >
//               <TableHead sx={{
//                 position:"sticky"
//               }}>
//         <TableRow>
//           <TableCell padding="checkbox">
//             <Checkbox
//               color="primary"
              
            
//               inputProps={{
//                 'aria-label': 'select all desserts',
//               }}
//             />
//           </TableCell>
//           {headCells.map((headCell) => (
//             <TableCell
//               key={headCell.id}
//               align={headCell.numeric ? 'right' : 'left'}
//               padding={headCell.disablePadding ? 'none' : 'normal'}
//               sortDirection={orderBy === headCell.id ? order : false}
//             >
              
//                 {headCell.label}
            
//             </TableCell>
//           ))}
//         </TableRow>
//       </TableHead>
//               <TableBody sx={{
//                 overflowY:"scroll" ,
//                 height:"280px"
//               }}>
//                 {rows.map((row, index) => {
//                   const isItemSelected = selected.includes(row.id);
//                   const labelId = `enhanced-table-checkbox-${index}`;
  
//                   return (
//                     <TableRow
//                       hover
//                       onClick={(event) => handleClick(event, row.id)}
//                       role="checkbox"
//                       aria-checked={isItemSelected}
//                       tabIndex={-1}
//                       key={row.id}
//                       selected={isItemSelected}
//                       sx={{ cursor: 'pointer' }}
//                     >
//                       <TableCell padding="checkbox">
//                         <Checkbox
//                           color="primary"
//                           checked={isItemSelected}
//                           inputProps={{
//                             'aria-labelledby': labelId,
//                           }}
//                         />
//                       </TableCell>
//                       <TableCell
//                         component="th"
//                         id={labelId}
//                         scope="row"
//                         padding="none"
//                       >
//                         {row.name}
//                       </TableCell>
//                       <TableCell align="right">{row.calories}</TableCell>
//                       <TableCell align="right">{row.fat}</TableCell>
//                       <TableCell align="right">{row.carbs}</TableCell>
//                       <TableCell align="right">{row.protein}</TableCell>
//                     </TableRow>
//                   );
//                 })}
               
//               </TableBody>
//             </Table>
//           </TableContainer>
  
//         </Paper>
    
//       </Box>
//     );
//   }
  