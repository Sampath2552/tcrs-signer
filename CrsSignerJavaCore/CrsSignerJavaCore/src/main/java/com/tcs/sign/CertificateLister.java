package com.tcs.sign;

import org.bouncycastle.asn1.x500.RDN;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x500.style.BCStyle;
import org.bouncycastle.asn1.x500.style.IETFUtils;
import org.bouncycastle.cert.jcajce.JcaX509CertificateHolder;
import org.bouncycastle.jce.PrincipalUtil;
import org.json.JSONObject;

import javax.security.auth.x500.X500Principal;
import java.io.IOException;
import java.math.BigInteger;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.Principal;
import java.security.cert.CertificateEncodingException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.*;

public class CertificateLister {
    public static JSONObject getCertificatesList() {

        JSONObject certificateListObj = new JSONObject();
        List<Map<String, Object>> certsList = new ArrayList<>();
        // Load the Windows-MY keystore
        KeyStore keyStore;
        Enumeration<String> aliases;
        try {
            keyStore = KeyStore.getInstance("Windows-MY");
            keyStore.load(null, null);
            aliases = keyStore.aliases();

        } catch (KeyStoreException | CertificateException | IOException | NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }

        // Iterate over certificates

        SimpleDateFormat formatPattern = new SimpleDateFormat("dd MMM yyyy");
        while (aliases != null && aliases.hasMoreElements()) {
            Map<String, Object> certDetails = new HashMap<String, Object>();
            String alias = aliases.nextElement();
            X509Certificate cert;
            try {
                cert = (X509Certificate) keyStore.getCertificate(alias);
                if ((keyStore.isKeyEntry(alias)) && (cert != null) && (cert.getKeyUsage() != null)) {
                    certDetails.put("alias", alias);
                    certDetails.put("expirationDate", formatPattern.format(cert.getNotAfter()));
                    // X500Principal subjectPrincipal = cert.getSubjectX500Principal();
                    // X500Name subjectX500name = new X500Name(subjectPrincipal.getName());
                    // X500Name subjectX500name = new X500Name(PrincipalUtil.getSubjectX509Principal(cert).getName());
                    X500Name subjectX500name = new JcaX509CertificateHolder(cert).getSubject();
                    RDN subjectCN = subjectX500name.getRDNs(BCStyle.CN)[0];
                    certDetails.put("issuedTo", IETFUtils.valueToString(subjectCN.getFirst().getValue()));
                    X500Principal issuerPrincipal = cert.getIssuerX500Principal();
                    // X500Name issuerX500name = new X500Name(issuerPrincipal.getName());
                    // X500Name issuerX500name = new X500Name(PrincipalUtil.getIssuerX509Principal(cert).getName());
                    X500Name issuerX500name = new JcaX509CertificateHolder(cert).getIssuer();
                    String serialNo = String.valueOf(cert.getSerialNumber());
                    RDN issuerCN = issuerX500name.getRDNs(BCStyle.CN)[0];
                    certDetails.put("issuerDetails", issuerPrincipal);
                    certDetails.put("issuedBy", IETFUtils.valueToString(issuerCN.getFirst().getValue()));
                    System.out.println(cert.getSigAlgName());
                    Date today = new Date();
                    // The Current date should not be after the expiration date and not before the starting date
                    boolean validity = !today.after(cert.getNotAfter()) && !today.before(cert.getNotBefore());
                    certDetails.put("validity", validity);
                    certDetails.put("serialNo", serialNo);
                    certDetails.put("fromDll", false);
                    System.out.println(serialNo);

                    certsList.add(certDetails);
                }
            } catch (KeyStoreException e) {
                throw new RuntimeException(e);
            } catch (CertificateEncodingException e) {
                System.out.println("CertificateEncodingException :: " + e.getMessage());
            }


        }
        certificateListObj.put("certs", certsList);
        System.out.println(certificateListObj);
        return (certificateListObj);
    }

    public static X509Certificate getCertificate(String alias) {
        X509Certificate cert;
        // Load the Windows-MY keystore
        KeyStore keyStore;
        Enumeration<String> aliases;
        try {
            keyStore = KeyStore.getInstance("Windows-MY");
            keyStore.load(null, null);
            cert = (X509Certificate) keyStore.getCertificate(alias);

        } catch (KeyStoreException | CertificateException | IOException | NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
        return cert;
    }

    public static void main(String[] args) {
        System.out.println(getCertificatesList());
    }
}


