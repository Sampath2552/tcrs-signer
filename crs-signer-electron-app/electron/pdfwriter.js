const fs= require('fs')
const path = require('path')
const os = require('os')
const createPdf = (fileName,fileContent) =>
{       
    try{
        const pdfContentBuffer = Buffer.from(fileContent,'base64')
        const downloadsFolderPath = path.join(os.homedir(),'Downloads')
        const targetFolder = path.join(downloadsFolderPath,"CRS")
        if(!fs.existsSync(targetFolder))
        {
            fs.mkdirSync(targetFolder)
        }
        const pdfFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`
        const pdfFilePath = path.join(targetFolder,pdfFileName)
        fs.writeFileSync(pdfFilePath,pdfContentBuffer,(err)=>{
            if(err)
            {  console.log(err)
                return false
            }
        })
        return true
    }
    catch(err)
    {   
        console.log(err)
        return false
    }
    
}
module.exports = {createPdf}