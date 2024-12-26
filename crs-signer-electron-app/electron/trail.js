
const tokens=["eMudhra","SafeNet","Gemalto 32 Bit","Gemalto 64 Bit","ePass","SafeSign","Trust Key","Belgium eiD MiddleWare","Aladin eToken","Safe net I key","StarKey","Watchdata PROXkey","mToken"
    ,"HYPERSEC"
 ]
 const dllPaths=["eTPKCS11.dll","eTPKCS11.dll","IDPrimePKCS11.dll","IDPrimePKCS1164.dll","eps2003csp11.dll","aetpkss1.dll","wdpkcs.dll","beidpkcs11.dll","eTPKCS11.dll","dkck201.dll","aetpkssl.dll","SignatureP11.dll","CryptoIDA_pkcs11.dll"
    ,"eps2003csp11v2.dll"
   ]
let successCount =0;
let failureCount =0;
const configChanger= (details) =>{
    //const name ="token"
    const tokenname = details.toLowerCase()
    let index =-1
  
    for(let i=0;i<tokens.length;i++)
    {
      if (tokenname.includes(tokens[i].toLowerCase()))
      {
        index =i
      
      
      }
    }
    if(index==-1)
    {
      console.log(tokenname + '-' + "Doesnt Exist")
      failureCount++;
    }
    else
    {
      let dllPath = dllPaths[index]
       // console.log(tokenname + '-'+dllPath)
        successCount++;
    }
    
  }
let names= [
    "emudhra token",
    "watchdata proxkey",
    "Feitian ePass2003",
    "WD Proxkey",
    "eMudhra USB key",
    "safeNet etoken",
    "safeNet 5110",
    "safeNet Usb key",
    "safeNet etoken pro",
    "Geamlto Safenet",
    "Safenet Authentication Token",
    "Gemlato usb key",
    "gemalto idprime",
    "gemalto safenet",
    "gemalto etoken",
    "feitain epass2003",
    "ft epass2003",
    "epass2003",
    "feitain usb token",
    "epass2003 Auto",
    "Feitian epass2003-Auto",
    "Feitian epass token",
    "epass3000",
    "Feitian epass3000",
    "Safesign Identity Client",
    "Safesign MiddleWare",
    "Safesign standard token",
    "Safesign pki client",
    "Trust Key USB Token",
    "Trust Key",
    "Trust Key USB",
    "Trust KEy Authentication Device",
    "Trust Key smart card",
    "Trust Key Smart Card",
    "Trust Key eToken",
    "Belgium eid",
    "BElgium Electronic id card",
    "eid belgium",
    "eid reader",
    "belgium eid reader",
    "eid usb reader",
    "eid card reader",
    "belgium eid middleware",
    "Aladdin eToken",
    "eToken USb",
    "Aladdin usb token",
    "eToken Authentication device",
    "eToken 5110",
    "eToken Pro",
    "eToken 5100",
    "eToken 7300",
    "SafeNet ikey",
    "SafeNet usb token",
    "Safenet usb token",
    "Safenet ikey 1000",
    "Safenet ikey 2032",
    "Safenet ikey 3000",
    "starkey usb token",
    "starkey security token",
    "starkey authentication device",
    "mtoken usb token",
    "mtoken authentication device",
    "mtoken",
    "mtoken secure token",
    "longmai mtoken",
    "longmai mtoken crypto ida",
    "longmai usb token",
    "longmai pki token",
    "mtoken 3000",
    "mtoken 5000",
    "mtoken 2000",
    "longmai mtoken crypto ida",
    "longmai crypto ida token",
    "longmai usb token",
    "hypersecure usb token",
    "hypersecure authentication token",
    "hypersecure pki token",
    "hypersecure security token",
    "hupersecure token 1000",
    "hypersecure digital",
    "hypersecure digial authentication device",
    "hypersecure token pro",
    "hypersecu token",
    "hypersecu usb token",
    "hypersecu security token",
    "hypersecu token 2000",
    "hypersecu etoken",
    "hypersecu fido u2f token"
  
]

for(let i=0;i<names.length;i++)
{
    configChanger(names[i])
}
 
console.log("Total Count = " + names.length)
console.log("Success Count ="+ successCount)
console.log("Failure Count ="+failureCount)