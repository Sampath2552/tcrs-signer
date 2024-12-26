package com.tcs.server;


import com.tcs.sign.CertificateLister;
import com.tcs.sign.SignAtBookmarks;

import org.bouncycastle.cms.CMSException;
import org.bouncycastle.operator.OperatorCreationException;
import org.eclipse.jetty.websocket.api.annotations.*;
import org.json.JSONObject;
import org.eclipse.jetty.websocket.api.Session;


import java.io.IOException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;

import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.util.*;


@WebSocket()
public class ServerEndPointServlet {
    private static byte[] pdfOutputContent;
    private static Session currentUserSession;
    public static byte[] getPdfOutputContent() {
        return pdfOutputContent;
    }
    public static void setPdfOutputContent(byte[] pdfOutputContent) {
       ServerEndPointServlet.pdfOutputContent = pdfOutputContent;
    }
    @OnWebSocketConnect
    public void handleOpen(Session userSession)
    {
        System.out.println("Connected:"+userSession.getRemoteAddress());
        currentUserSession = userSession;
    }
    @OnWebSocketMessage
    public void handleMessage(String incomingMessage) {
        // Get the Incoming Message
        JSONObject jsonIncomingObject = new JSONObject(incomingMessage);
        System.out.println(incomingMessage);
        System.out.println(jsonIncomingObject);
        /*
        * flagForSigning = 1 -> Continue with signing process
        * flagForSigning = 2 -> give list of certificates present in windows-my
        * flagForSigning = 0 -> Close the program */
        int flagForSigning = Integer.parseInt(jsonIncomingObject.getString("flagForSigning"));
        if(flagForSigning==1)
        {
            JSONObject jsonOutgoingObject = new JSONObject();
            boolean dllSigningFlag = Boolean.parseBoolean(jsonIncomingObject.getString("dllSigningFlag"));
            if(dllSigningFlag)
            {

                try{
                    try {
                        String password = jsonIncomingObject.getString("password");
                        int flag = SignAtBookmarks.checkPassword(password);
                        System.out.println(flag);
                        if (flag == 1)
                        {
                            String base64String = jsonIncomingObject.getString("data");
                            byte[] barr = Base64.getDecoder().decode(base64String);
                            String role = jsonIncomingObject.getString("role");
                            Map<String,Object> signedMap =  SignAtBookmarks.configureSignatureForByteArray(password, barr , role);
                            int signProcessFlag = (int) signedMap.get("signProcessFlag");
                            if(signProcessFlag == 1)
                            {   byte[] pdfByteContent = (byte[]) signedMap.get("signedContent");
                                if (pdfByteContent.length != 0) {
//                                   File Signed Successfully
                                    ServerEndPointServlet.setPdfOutputContent(pdfByteContent);
                                    String base64OutgoingMessage= Base64.getEncoder().encodeToString(getPdfOutputContent());
                                    jsonOutgoingObject.put("status","111");
                                    jsonOutgoingObject.put("signedData",base64OutgoingMessage);
                                } else {
//                                  Signing Failed - Please Try Again
                                    jsonOutgoingObject.put("status","110");
                                }
                            } else if (signProcessFlag == 2) {
                                jsonOutgoingObject.put("status","112");
                            } else if (signProcessFlag == 3) {
                                jsonOutgoingObject.put("status","113");
                            } else if (signProcessFlag ==4) {
                                jsonOutgoingObject.put("status","114");
                            } else
                            {
                                jsonOutgoingObject.put("status","110");
                            }
                        }
                        else if (flag == -1) {
//                                Error Loading Token, Verify your token and Try again
                            jsonOutgoingObject.put("status","120");
                        }
                        else if (flag == -2) {
//                                Verify Whether Token dll is installed and check Token Installation Path
                            jsonOutgoingObject.put("status","130");
                        }
                        else {
//                            Incorrect Password!!!!!
                            jsonOutgoingObject.put("status","100");
                        }
                    } catch (KeyStoreException | CertificateException | IOException | NoSuchAlgorithmException |
                             UnrecoverableKeyException | CMSException | OperatorCreationException ex) {
                        System.out.println(ex.getMessage());
                    }
                }

                catch( Exception ignored)
                {
                    // Do Nothing
                }
            }


            else
            {

            }
            if(!jsonOutgoingObject.isEmpty())
            {
                ServerEndPointServlet.messageSender(jsonOutgoingObject.toString());
            }

        }
        else if (flagForSigning == 2) {
            JSONObject jsonOutgoingObject = CertificateLister.getCertificatesList();

                ServerEndPointServlet.messageSender(jsonOutgoingObject.toString());

        }
        // This is used to close the socket in case tcrs is closed
        else
        {   JettyServer.stop();
            System.exit(0);
        }


    }
    @OnWebSocketClose
    public void onClose(int statusCode, String reason) {
        System.out.println("Close: statusCode=" + statusCode + ", reason=" + reason);
    }
    @OnWebSocketError
    public void handleError(Throwable t)
    {
       System.out.println("Socket Error");
    }
    public static void messageSender(String resultantMessage)  {

        try {
            currentUserSession.getRemote().sendString(resultantMessage);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}