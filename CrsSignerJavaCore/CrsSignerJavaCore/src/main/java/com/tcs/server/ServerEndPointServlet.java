package com.tcs.server;


import com.tcs.sign.CertificateLister;
import com.tcs.sign.SignAtBookmarks;

import com.tcs.sign.TokenCertificateLister;
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


                try{
                    try {
                        String base64String = jsonIncomingObject.getString("data");
                        byte[] barr = Base64.getDecoder().decode(base64String);
                        String role = jsonIncomingObject.getString("role");
                        if(dllSigningFlag)
                        {   System.out.println("In Password Flow");
                            String password = jsonIncomingObject.getString("password");
                            int flag = SignAtBookmarks.checkPassword(password);
                            System.out.println(flag);
                            if (flag == 1)
                            {
                                String multiSignFlag = jsonIncomingObject.getString("multiSignFlag");
                                String reportId = jsonIncomingObject.getString("reportId");
                                Map<String,Object> signedMap =  SignAtBookmarks.configureSignatureForByteArray(password, barr , role);
                                jsonOutgoingObject = jsonCreator(multiSignFlag,reportId,signedMap);
                                jsonOutgoingObject.put("methodUsed","dll");
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
                        }
                        else {
                            System.out.println("Inside alias flow");
                            String alias = jsonIncomingObject.getString("alias");
                            Map<String,Object> signedMap =  SignAtBookmarks.configureSignatureForByteArrayWithWindowsMy("", barr , role,alias);
                            System.out.println(signedMap.get("signedContent"));

                            System.out.println("Incoming map multiple flag =" + jsonIncomingObject.getString("multiSignFlag"));
                            String multiSignFlag = jsonIncomingObject.getString("multiSignFlag");
                            String reportId = jsonIncomingObject.getString("reportId");
                            System.out.println(Base64.getEncoder().encodeToString((byte[]) signedMap.get("signedContent")).length());
                            jsonOutgoingObject = ServerEndPointServlet.jsonCreator(multiSignFlag,reportId,signedMap);
                            jsonOutgoingObject.put("methodUsed","Windows-My");
                            System.out.println("JSOn Outgoing Object Recevied from JSON creator = "+jsonOutgoingObject.toString());
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


            System.out.println("Object being sent ="+jsonOutgoingObject.toString());
            if(!jsonOutgoingObject.isEmpty())
            {   System.out.println("Object being sent ="+jsonOutgoingObject);
                ServerEndPointServlet.messageSender(jsonOutgoingObject.toString());
            }

        }


        else if (flagForSigning == 2) {
            boolean dllSigningFlag = Boolean.parseBoolean(jsonIncomingObject.getString("dllSigningFlag"));
            JSONObject jsonOutgoingObject =null;
            if(dllSigningFlag)
            {
                String password = jsonIncomingObject.getString("password");
                jsonOutgoingObject = TokenCertificateLister.getCertificatesFromToken(password);

            }
            else {
               jsonOutgoingObject = CertificateLister.getCertificatesList();
            }


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
            System.out.println(resultantMessage);
            currentUserSession.getRemote().sendString(resultantMessage);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    public static JSONObject jsonCreator( String multiSignFlag, String reportId, Map<String,Object> signedMap)
    {   JSONObject tempJsonOutgoingObject = new JSONObject();
        System.out.println("json creator is called");
        int signProcessFlag = (int) signedMap.get("signProcessFlag");
        System.out.println("SignProcess flag ="+signProcessFlag);
        if(signProcessFlag == 1)
        {   byte[] pdfByteContent = (byte[]) signedMap.get("signedContent");
            if (pdfByteContent.length != 0) {
//                                   File Signed Successfully
                ServerEndPointServlet.setPdfOutputContent(pdfByteContent);
                String base64OutgoingMessage= Base64.getEncoder().encodeToString(getPdfOutputContent());
                tempJsonOutgoingObject.put("status","111");
                tempJsonOutgoingObject.put("signedData",base64OutgoingMessage);
            } else {
//                                  Signing Failed - Please Try Again
                tempJsonOutgoingObject.put("status","110");
            }
        } else if (signProcessFlag == 2) {
            tempJsonOutgoingObject.put("status","112");
        } else if (signProcessFlag == 3) {
            tempJsonOutgoingObject.put("status","113");
        } else if (signProcessFlag ==4) {
            tempJsonOutgoingObject.put("status","114");
        } else
        {
            tempJsonOutgoingObject.put("status","110");
        }
        tempJsonOutgoingObject.put("reportId",reportId);
        tempJsonOutgoingObject.put("multiSignFlag",multiSignFlag);
        System.out.println("JSON outgoing object which is being sent from JSON Creator ="+tempJsonOutgoingObject.toString());
        return  tempJsonOutgoingObject;
    }
}