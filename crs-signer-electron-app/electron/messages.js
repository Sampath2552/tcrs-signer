const signingStatusMessage={
    "111":{status:111,header:"Success",description:"File Signed Successfully"},
    "100":{status:100,header:"Invalid Password",description:"The password you have entered is invalid.Please try again."},
    "110":{status:110,header:"Signing Failed ",description:"Signing failed Please try again. "},
    "112":{status:112,header:"Certificate Not yet valid",description:"You are trying to use the certificate even before. "},
    "113":{status:113,header:"Certificate Expired",description:"Your are trying to use an expired certificate."},
    "114":{status:114,header:"No Certificates",description:"There are no certificates in the token."},
    "115":{status:115,header:"No Bookmark found",description:"Signing aborted due to invalid PDF format."},
    "120":{status:120,header:"No Token",description:"Error verifying the Token. Please try again with the appropriate Token."},
    "130":{status:130,header:"Invalid DLL",description:"Please verify whether you have selected the correct dll. Verify whether the token dll is installed or not."}

}
const certificateExtractionMessages= {
    '0':{status:0,header:"Invalid Password",description:"The password you have entered is invalid. Please try again"},
    '1':{status:1,header:"Token Configured",description:"The Token is successfully configured and you can continue signing"},
    '-1':{status:-1,header:"No Token",description:"Error verifying the Token. Please try again with the appropriate Token"},
    '-2':{status:-2, header:"Invalid DLL",description:"Please verify whether you have selected the correct dll. Verify whether the token dll is installed or not."}
}
const paths={
    sessionPath:{
        "local":"./electron/Tcrs.jar",
        "build":"./resources/app/electron/Tcrs.jar"
    },
    build:{
        "local":"../app/build/index.html",
        "build":"../build/index.html"
    },
    validationURLs:{
        "l":"http://10.0.26.102:9000",
        "d":"https://crsdev.info.sbi",
        "u":"https://crsuat.info.sbi",
        "p":"https://crs.sbi"
    }
}
const buildEnv="p"
const localEnv = "build"
module.exports={signingStatusMessage,certificateExtractionMessages,paths,buildEnv,localEnv}