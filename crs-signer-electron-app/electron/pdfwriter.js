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
const readLog = async () => {
    const data = await fs.promises.readFile(path.join(__dirname,"app.log"),"utf8");
    const base64Content = Buffer.from(data,'utf8').toString("base64")
    return base64Content
}
const deleteLog = () =>{
    const filePath = path.join(__dirname,"app.log")
    if(fs.existsSync(filePath))
    {
        fs.unlinkSync(path.join(__dirname,"app.log"))
    }
}

module.exports = {createPdf,readLog,deleteLog}