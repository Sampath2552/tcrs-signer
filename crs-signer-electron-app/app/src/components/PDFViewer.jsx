import React, {useEffect, useState} from 'react';
import {Viewer, Worker} from '@react-pdf-viewer/core';

import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
//import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import {Container, TextField} from "@mui/material";

const PdfViewer = ({pdfData}) => {
  const [pdfUrl, setPdfUrl] = useState(null);
 
  const transform = (slot)=>({
    ...slot,
    Print:()=><></>,
    Download:()=><></>,
    Open:()=><></>,
    ShowSearchPopover:()=><></>,
    CurrentPageInput:()=><></>,
    GoToPreviousPage:()=><></>,
    NumberOfPages:()=><></>,
    GoToNextPage:()=><></>,
    ShowPropertiesMenu:()=><></>,
    SwitchScrollModeMenuItem:()=><></>,
    EnterFullScreen:()=><></>,
    GoToFirstPageMenuItem:()=><></>,
    GoToLastPageMenuItem:()=><></>,
    SwitchSelectionModeMenuItem:()=><></>

  })
  const renderToolbar = (Toolbar) => <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    sidebarTabs:()=>{return []}
  })
  const {renderDefaultToolbar} = defaultLayoutPluginInstance.toolbarPluginInstance
  useEffect(() => {
    /**
    * * Converting base64 String data to byte array.*/
    const byteCharecters = atob(pdfData);
    const byteNumbers = new Array(byteCharecters.length);
    for (let i = 0; i < byteCharecters.length; i++) {
      byteNumbers[i] = byteCharecters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    /**
    * * Converting byte array to URL using Blob*/
    const blob = new Blob([byteArray], {type: 'application/pdf'});
    setPdfUrl(URL.createObjectURL(blob));
    /*/!**
    * * For downloading PDF this can be helpful.*!/
    * const handleDownload = () => {
    *       const a = document.createElement('a');
    *       a.href = pdfUrl;
    *   a.download = 'Document.pdf';
    *   a.click();
    *  URL.revokeObjectURL(pdfUrl);
    *    };*/
  }, [pdfData]);
  /**
  * * For rendering this component*/
  return (
    <div style={{width: '100%' }}>
    
      <Container style={{ }}>
          
         <Worker style={{ }} workerUrl='./Assets/pdf.worker.min.js'>
         {pdfUrl &&   <Viewer style={{ }} plugins={[defaultLayoutPluginInstance]} fileUrl={pdfUrl}/> }
        
      </Worker>
      </Container>
    </div>
  )
}
export default PdfViewer


