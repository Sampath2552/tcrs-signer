package com.tcs.sign;
import org.bouncycastle.asn1.x500.RDN;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x500.style.BCStyle;
import org.bouncycastle.asn1.x500.style.IETFUtils;
import org.json.JSONObject;

import javax.security.auth.x500.X500Principal;
import java.io.IOException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.*;

public class CertificateLister {
    public static JSONObject getCertificatesList() {

        JSONObject certificateListObj = new JSONObject();
        List<Map<String, Object>> certsList = new ArrayList<>();
        // Load the Windows-MY keystore
        KeyStore keyStore ;
        Enumeration<String> aliases ;
        try {
            keyStore = KeyStore.getInstance("Windows-MY");
            keyStore.load(null, null);
            aliases = keyStore.aliases();

        } catch (KeyStoreException | CertificateException | IOException | NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }

        // Iterate over certificates


        while (aliases !=null  && aliases.hasMoreElements()) {
            Map<String, Object> certDetails = new HashMap<String, Object>();
            String alias = aliases.nextElement();
            X509Certificate cert;
            try {
                cert = (X509Certificate) keyStore.getCertificate(alias);
                if ((keyStore.isKeyEntry(alias)) && (cert != null) && (cert.getKeyUsage() != null)) {
                    certDetails.put("alias", alias);
                    certDetails.put("expirationDate", cert.getNotAfter());
                    X500Principal subjectPrincipal = cert.getSubjectX500Principal();
                    X500Name subjectX500name = new X500Name(subjectPrincipal.getName());
                    RDN cn = subjectX500name.getRDNs(BCStyle.CN)[0];
                    certDetails.put("subjectCN", IETFUtils.valueToString(cn.getFirst().getValue()));
                    X500Principal issuerPrincipal = cert.getIssuerX500Principal();
                    X500Name issuerX500name = new X500Name(issuerPrincipal.getName());
                    RDN icn = issuerX500name.getRDNs(BCStyle.CN)[0];
                    certDetails.put("issuerCN", IETFUtils.valueToString(icn.getFirst().getValue()));
                    Date today = new Date();
                    // The Current date should not be after the expiration date and not before the starting date
                    boolean validity = !today.after(cert.getNotAfter()) && !today.before(cert.getNotBefore());
                    certDetails.put("validity", validity);
                    certsList.add(certDetails);
                }
            } catch (KeyStoreException e) {
                throw new RuntimeException(e);
            }



        }
        certificateListObj.put("certs", certsList);
        return (certificateListObj);
    }
    public static X509Certificate getCertificate(String alias) {
        X509Certificate cert ;
        // Load the Windows-MY keystore
        KeyStore keyStore ;
        Enumeration<String> aliases ;
        try {
            keyStore = KeyStore.getInstance("Windows-MY");
            keyStore.load(null, null);
            cert = (X509Certificate) keyStore.getCertificate(alias);

        } catch (KeyStoreException | CertificateException | IOException | NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
        return cert;
    }
}


