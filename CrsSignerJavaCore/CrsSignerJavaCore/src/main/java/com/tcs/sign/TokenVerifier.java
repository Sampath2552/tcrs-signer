package com.tcs.sign;





import java.io.*;

import java.security.*;

import java.security.cert.CertificateException;



public class TokenVerifier {



    public static void main(String[] args) throws KeyStoreException, IOException, NoSuchAlgorithmException, CertificateException {

        int flag = SignAtBookmarks.checkPassword(args[0]);


        System.out.println(flag);

    }
}
