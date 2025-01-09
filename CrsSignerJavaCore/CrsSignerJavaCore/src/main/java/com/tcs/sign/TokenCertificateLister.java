package com.tcs.sign;

import org.bouncycastle.asn1.x500.RDN;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x500.style.BCStyle;
import org.bouncycastle.asn1.x500.style.IETFUtils;
import org.json.JSONObject;
import sun.security.pkcs11.wrapper.PKCS11Exception;

import javax.security.auth.x500.X500Principal;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.security.*;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.*;

public class TokenCertificateLister {
    private static final String CFG_FILE_PATH=System.getProperty("user.home") + File.separator + "AppData" +File.separator + "Roaming" + File.separator +"TCRS-Signer" + File.separator + "config.cfg";
    public static JSONObject getCertificatesFromToken(String password) {
        String configlocation = CFG_FILE_PATH;
        JSONObject certDetails = new JSONObject();
        
        
        int flag=0;
        sun.security.pkcs11.SunPKCS11 providerPKCS11 = null;

        KeyStore keyStore = null;
        try{
            providerPKCS11 =new sun.security.pkcs11.SunPKCS11(configlocation);
            Security.addProvider(providerPKCS11);
            keyStore = KeyStore.getInstance("PKCS11",providerPKCS11);
        }
        catch (ProviderException e) {
//            System.out.println("Catch 1");
//            e.printStackTrace();

            certDetails.put("flag",-2);
            return certDetails;
        }
        catch(RuntimeException | KeyStoreException e ){
//            System.out.println("Catch 2");
//            e.printStackTrace();
            certDetails.put("flag",-1);
            return certDetails;
        }


        try
        {
            keyStore.load(null,password.toCharArray());
            certDetails.put("flag",1);
            Enumeration<String> aliases = keyStore.aliases();
            String alias= aliases.nextElement();
            Certificate[] cl=  keyStore.getCertificateChain(alias);
            if(cl.length==0)
            {
                certDetails.put("flag",4);
                return certDetails;
            }
            SimpleDateFormat formatPattern = new SimpleDateFormat("dd MMM yyyy");
            X509Certificate cert = (X509Certificate) cl[0];

                certDetails.put("alias", alias);
                certDetails.put("expirationDate", formatPattern.format(cert.getNotAfter()));
                X500Principal subjectPrincipal = cert.getSubjectX500Principal();
                X500Name subjectX500name = new X500Name(subjectPrincipal.getName());
                RDN subjectCN = subjectX500name.getRDNs(BCStyle.CN)[0];
                certDetails.put("issuedTo", IETFUtils.valueToString(subjectCN.getFirst().getValue()));
                X500Principal issuerPrincipal = cert.getIssuerX500Principal();
                X500Name issuerX500name = new X500Name(issuerPrincipal.getName());
                String serialNo = String.valueOf(cert.getSerialNumber());
                RDN issuerCN = issuerX500name.getRDNs(BCStyle.CN)[0];
                certDetails.put("issuerDetails",issuerPrincipal);
                certDetails.put("issuedBy", IETFUtils.valueToString(issuerCN.getFirst().getValue()));
                System.out.println(cert.getSigAlgName());
                Date today = new Date();
                // The Current date should not be after the expiration date and not before the starting date
                boolean validity = !today.after(cert.getNotAfter()) && !today.before(cert.getNotBefore());
                certDetails.put("validity", validity);
                certDetails.put("serialNo",serialNo);
                certDetails.put("fromDll",true);
                certDetails.put("password",password);




        }
        catch (NoSuchAlgorithmException |  CertificateException e)
        {
            certDetails.put("flag",4);
            return certDetails;
        }
        catch (IOException | KeyStoreException e )
        {
           e.printStackTrace();
            certDetails.put("flag",0);
            return certDetails;

        }

        return certDetails;
        

    }
    public static void slotList() throws PKCS11Exception, IOException {
        sun.security.pkcs11.wrapper.PKCS11 pkcs11 = sun.security.pkcs11.wrapper.PKCS11.getInstance("C:\\Windows\\System32\\eps2003csp11v2.dll","C_GetFunctionList",null,false) ;
        long[] slots= pkcs11.C_GetSlotList(true);
        System.out.println(slots.length);
        for(long slot:slots)
        {
            sun.security.pkcs11.wrapper.CK_TOKEN_INFO tokenInfo = pkcs11.C_GetTokenInfo(slot);
            System.out.println("Token Label = " + new String(tokenInfo.label));
//            System.out.println("Token Manufacturer ID = " + new String(tokenInfo.manufacturerID));
//            System.out.println("Token Model = " + new String(tokenInfo.model));
//            System.out.println("Token UTC Time = " + new String(tokenInfo.utcTime));

        }
    }
    public static void main(String[] args) throws PKCS11Exception, IOException {
       System.out.println(getCertificatesFromToken("Password123").toString());
        slotList();
    }

}
