import React from "react"
import {Viewer,Worker} from "@react-pdf-viewer/core"
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry"
import {pdfjs} from "react-pdf"
import {Container} from "@mui/material";
import { useState,useEffect } from "react"
// pdfjs.GlobalWorkerOptions.workerSrc= pdfWorker

const PdfV = ({pdfData}) => {

    const [pdfUrl, setPdfUrl] = useState();
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
      <div style={{width: '100%', height: '70vh'}}>
        
        <Container>
          
       
           <Worker>
           <Viewer fileUrl={pdfUrl}/>
        </Worker>
        </Container>
      </div>
    )
  }
  export default PdfV
  
  
  