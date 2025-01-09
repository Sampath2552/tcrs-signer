package com.tcs.sign;


import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.IOUtils;
import org.apache.pdfbox.io.RandomAccessRead;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.common.PDStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.form.PDFormXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationWidget;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAppearanceDictionary;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAppearanceStream;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.ExternalSigningSupport;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.SignatureOptions;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.visible.PDVisibleSigProperties;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDSignatureField;
import org.apache.pdfbox.util.Matrix;
import org.bouncycastle.asn1.x500.RDN;
import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x500.style.BCStyle;
import org.bouncycastle.asn1.x500.style.IETFUtils;
import org.bouncycastle.cert.X509CertificateHolder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateHolder;
import org.bouncycastle.cms.*;
import org.bouncycastle.cms.jcajce.JcaSignerInfoGeneratorBuilder;
import org.bouncycastle.operator.ContentSigner;

import org.bouncycastle.operator.OperatorCreationException;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.operator.jcajce.JcaDigestCalculatorProviderBuilder;

import javax.imageio.ImageIO;
import javax.security.auth.x500.X500Principal;
import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.*;
import java.security.cert.*;
import java.security.cert.Certificate;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;

public class SignAtBookmarks {
    private static final String CFG_FILE_PATH=System.getProperty("user.home") + File.separator + "AppData" +File.separator + "Roaming" + File.separator +"TCRS-Signer" + File.separator + "config.cfg";
    private static final String TEMP_FILE_PATH = System.getProperty("user.home") + File.separator + "AppData" +File.separator + "Roaming" + File.separator +"TCRS-Signer"  + File.separator + "Temp" + File.separator + "Signed_Report.pdf";
    public static int checkPassword(String pass) throws KeyStoreException, CertificateException, IOException, NoSuchAlgorithmException {
        String configlocation =    CFG_FILE_PATH;
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

            flag=-2;
//            System.exit(1);
            return flag;
        }
        catch(RuntimeException | KeyStoreException e ){
//            System.out.println("Catch 2");
//            e.printStackTrace();
            flag=-1;
//            System.exit(1);
            return flag;
        }


        try
        {
            keyStore.load(null,pass.toCharArray());
            flag=1;


        }
        catch (IOException e)
      {

            flag=0;

        }
        finally {
            return flag;
        }

    }
    public static boolean configureSignature(String pass,String src,String role) throws KeyStoreException, CertificateException, IOException, NoSuchAlgorithmException, UnrecoverableKeyException, OperatorCreationException, CMSException {
        boolean state = false;

        String configlocation = CFG_FILE_PATH;

        // Extracting Properties From USB Token

        sun.security.pkcs11.SunPKCS11 providerPKCS11 = new sun.security.pkcs11.SunPKCS11(configlocation);
        Security.addProvider(providerPKCS11);

        KeyStore keyStore = KeyStore.getInstance("PKCS11");
        keyStore.load(null,pass.toCharArray());

        Enumeration<String> aliases = keyStore.aliases();
        System.out.println(aliases.toString());
        String alias= aliases.nextElement();
        Certificate[] cl=  keyStore.getCertificateChain(alias);
        PrivateKey pk = (PrivateKey) keyStore.getKey(alias, pass.toCharArray());
        X509Certificate cert = (X509Certificate) cl[0];

        /*String DN = String.valueOf(cert.getSubjectX500Principal());
          System.out.println("DN="+DN);
        String cnComponent = DN.split(",")[0];
        String cnName = cnComponent.startsWith("CN=") ? cnComponent.substring(3) : "" ;*/
        X500Principal subjectPrincipal = cert.getSubjectX500Principal();
        X500Name subjectX500name = new X500Name(subjectPrincipal.getName());
        RDN cn = subjectX500name.getRDNs(BCStyle.CN)[0];
        String cnName =IETFUtils.valueToString(cn.getFirst().getValue());

        String s="";
        File srcFile = new File(src);


        PDDocument doc = Loader.loadPDF(srcFile);
        int noOfSignatures = doc.getSignatureDictionaries().size();

        PDPage firstpage = doc.getPage(0);
        float pageheight = firstpage.getMediaBox().getHeight();
        float pagewidth = firstpage.getMediaBox().getWidth();
        System.out.println(pageheight);
        System.out.println(pagewidth);
        String dest= src.replace(".pdf","")+ (noOfSignatures+1)+".pdf";
        File destFile = new File(dest);
        InputStream imageStream = null;
//        List<BookMark> bookmarks = ExtractBookmarks.extractB(srcFile);
        BookMark currentBookmark = ExtractBookmarks.extractSpecificBookmark(srcFile, role);
        System.out.println("Current BookMark = "+currentBookmark);
        float rectWidth = 130;
        float rectHeight = 50;
//        BookMark currentBookmark = null;
//        for(BookMark b:bookmarks){
//            if(b.bookmarkName.equals(currentUserRole))
//            {
//                currentBookmark=b;
//            }
//        }

       if(currentBookmark==null)
       {
           return false;
       }
        Rectangle2D humanRect = new Rectangle2D.Float(currentBookmark.getX(),currentBookmark.getY(), rectWidth, rectHeight);
        PDRectangle rect = createSignatureRectangle(doc,humanRect);
        int noOfPages = doc.getNumberOfPages();
        int lastPage = noOfPages -1;
        String location = "Location-"+(noOfSignatures+1);
        String reason = "Reason-"+(noOfSignatures+1);
        // Setting Up SignatureField
        PDSignature signature = new PDSignature();
        signature.setFilter(PDSignature.FILTER_ADOBE_PPKLITE);
        signature.setSubFilter(PDSignature.SUBFILTER_ADBE_PKCS7_DETACHED);
//        signature.setName(alias+ (noOfSignatures+1));;
        signature.setName(cnName);
        signature.setLocation(location);
        signature.setReason(reason);
//        signature.setContactInfo("Checker");
        signature.setSignDate(Calendar.getInstance());


        // Setting Up Signature Options
        PDVisibleSigProperties signatureProperties = new PDVisibleSigProperties();
        signatureProperties.signerName(alias).signerLocation(location)
                .signatureReason(reason).preferredSize(0).page(1)
                .visualSignEnabled(true);


        SignatureOptions signatureOptions = new SignatureOptions();


        signatureOptions.setVisualSignature(createVisualSignatureTemplate(doc,lastPage,rect,signature));
        signatureOptions.setPage(lastPage);


//        System.out.println("88888888888888888");

        // External Signing Support For Signature
        try{
            doc.addSignature(signature,signatureOptions);
            ExternalSigningSupport externalSigningSupport = doc.saveIncrementalForExternalSigning(Files.newOutputStream(destFile.toPath()));
            byte[] csmSignature = sign(externalSigningSupport.getContent(),cl,pk,cert);
            externalSigningSupport.setSignature(csmSignature);
            state=true;
        }
        catch(Exception e)
        {
            System.out.println(e.getMessage());
        }
        return  state;


    }
    public static byte[] sign(InputStream content, Certificate[] cl, PrivateKey pk, X509Certificate cert) throws CertificateEncodingException,  CMSException, IOException, OperatorCreationException {

        X509CertificateHolder certificateHolder = new JcaX509CertificateHolder(cert);
        CMSSignedDataGenerator gen = new CMSSignedDataGenerator();


        ContentSigner contentSigner = new JcaContentSignerBuilder("SHA256withRSA").build(pk);
        gen.addSignerInfoGenerator(new JcaSignerInfoGeneratorBuilder(new JcaDigestCalculatorProviderBuilder().build()).build(
                contentSigner,certificateHolder)
        );
        gen.addCertificate(certificateHolder);

        CMSTypedData msg = new CMSProcessableByteArray(IOUtils.toByteArray(content));
        System.out.println("Before Generate");
        CMSSignedData signedData = gen.generate(msg,false);
        System.out.println("After Generate");
        return  signedData.getEncoded();
    }




    private static InputStream createVisualSignatureTemplate(PDDocument srcDoc, int pageNum,
                                                             PDRectangle rect, PDSignature signature) throws IOException
    {
        try (PDDocument doc = new PDDocument())
        {
            PDPage page = new PDPage(srcDoc.getPage(pageNum).getMediaBox());
            doc.addPage(page);
            PDAcroForm acroForm = new PDAcroForm(doc);
            doc.getDocumentCatalog().setAcroForm(acroForm);
            PDSignatureField signatureField = new PDSignatureField(acroForm);
            PDAnnotationWidget widget = signatureField.getWidgets().get(0);
            List<PDField> acroFormFields = acroForm.getFields();
            acroForm.setSignaturesExist(true);
            acroForm.setAppendOnly(true);
            acroForm.getCOSObject().setDirect(true);
            acroFormFields.add(signatureField);
            widget.setRectangle(rect);
            // from PDVisualSigBuilder.createHolderForm()
            PDStream stream = new PDStream(doc);
            PDFormXObject form = new PDFormXObject(stream);
            PDResources res = new PDResources();
            form.setResources(res);
            form.setFormType(1);
            PDRectangle bbox = new PDRectangle(rect.getWidth(), rect.getHeight());
            float height = bbox.getHeight();
            Matrix initialScale = null;
            switch (srcDoc.getPage(pageNum).getRotation())
            {
                case 90:
                    form.setMatrix(AffineTransform.getQuadrantRotateInstance(1));
                    initialScale = Matrix.getScaleInstance(bbox.getWidth() / bbox.getHeight(), bbox.getHeight() / bbox.getWidth());
                    height = bbox.getWidth();
                    break;
                case 180:
                    form.setMatrix(AffineTransform.getQuadrantRotateInstance(2));
                    break;
                case 270:
                    form.setMatrix(AffineTransform.getQuadrantRotateInstance(3));
                    initialScale = Matrix.getScaleInstance(bbox.getWidth() / bbox.getHeight(), bbox.getHeight() / bbox.getWidth());
                    height = bbox.getWidth();
                    break;
                case 0:
                default:
                    break;
            }
            form.setBBox(bbox);
            PDFont font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            // from PDVisualSigBuilder.createAppearanceDictionary()
            PDAppearanceDictionary appearance = new PDAppearanceDictionary();
            appearance.getCOSObject().setDirect(true);
            PDAppearanceStream appearanceStream = new PDAppearanceStream(form.getCOSObject());
            appearance.setNormalAppearance(appearanceStream);
            widget.setAppearance(appearance);
            int pixelWidth = (int) rect.getWidth();


            try
            {
                //String imgPath = "src/images/logo.png";
//                ByteArrayOutputStream baos = new ByteArrayOutputStream();
//                ImageIO.write(bi, "png", baos);
//                return new ByteArrayInputStream(baos.toByteArray());

                InputStream inputStream = SignAtBookmarks.class.getResourceAsStream("/logo.png");
                System.out.println(inputStream);
                File tempFile = File.createTempFile("logotemp",".png");

                System.out.println(tempFile.getAbsolutePath());
                System.out.println(tempFile);
                Files.copy(inputStream,tempFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                tempFile.deleteOnExit();
//                PDImageXObject  imageXObject = PDImageXObject.createFromFile(imgPath,doc);
//                BufferedImage img = ImageIO.read(Objects.requireNonNull(SignAtBookmarks.class.getResourceAsStream("/logo.png")));
                //String img = String.valueOf(SignAtBookmarks.class.getResource("images/logo.png"));
//                System.out.println(img);
//                System.out.println("helo :: " + img.split(":")[2]);
//                System.out.println("helo :: " + img.split(":")[2]+ img.split(":")[3].replace("!",""));
                //  PDImageXObject imageXObject = PDImageXObject.createFromFile(    img.split(":")[2]+ img.split(":")[3].replace("!",""),doc);// for local texting [2]
//                URL fileURL = SignAtBookmarks.class.getResource("/images/logo.png");
//                Image img = ImageIO.read(fileURL);
////                File imgFile = (File) img;
                PDImageXObject imageXObject = PDImageXObject.createFromFileByExtension(tempFile,doc);

                PDPageContentStream cs = new PDPageContentStream(doc, appearanceStream);
                if (initialScale != null)
                {
                    cs.transform(initialScale);
                }
                // show background (just for debugging, to see the rect size + position)
                cs.drawImage(imageXObject, 0, 0,130,50);
                cs.setNonStrokingColor(Color.WHITE);
//                cs.addRect(-5000, -5000, 10000, 10000);
//                cs.fill();
                cs.setNonStrokingColor(Color.BLACK);
                // show text
                float fontSize = 6;
                float leading = fontSize * 1.5f;
                cs.beginText();
                cs.setFont(font, fontSize);
                cs.newLineAtOffset(fontSize, height - leading);
                cs.setLeading(leading);
//                float sx = fontSize;
//                float sy = height-leading;
                // Extracting Properties from Signature
                String name = signature.getName();
                SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
                SimpleDateFormat timeFormat = new SimpleDateFormat("hh:mm:ss");
                String date =  dateFormat.format(signature.getSignDate().getTime());
                String time = timeFormat.format(signature.getSignDate().getTime());
                String reason  = "Reason: " +  signature.getReason();
                String location = "Location: "+ signature.getLocation();
                String signedByText =  name;
//                addParagraph(cs,sx,sy,8,width,signedByText);
                System.out.println(signedByText);
//                List<List<String>>  paragraph = new ArrayList<>();
//                paragraph.add(wrapString(signedByText,pixelWidth,font,(int) fontSize));
//                paragraph.add(wrapString("Date:"+ date+" "+time+"",pixelWidth,font,(int) fontSize));
//                paragraph.add(wrapString(reason,pixelWidth,font,(int) fontSize));
//                paragraph.add(wrapString(location,pixelWidth,font,(int) fontSize));
//                for(List<String> lines:paragraph)
//                {
//                    for(String line:lines)
//                    {
//                        cs.showText(line);
//                        cs.newLine();
//                    }
//                }
                cs.showText("Signed By:");
                cs.newLine();
                System.out.println("Signed By ="+ signedByText);
                cs.showText(signedByText);
                cs.newLine();
                cs.showText("Date:" +date+" "+time+" IST");
                cs.newLine();
//                cs.showText("Reason:" +reason);
//                cs.newLine();
//                cs.showText("Location:" +location);
//                cs.newLine();
                cs.endText();
                cs.close();
                System.out.println(rect.getLowerLeftX());
                System.out.println(rect.getLowerLeftY());
                System.out.println(rect.getUpperRightX());
                System.out.println(rect.getUpperRightY());
            } catch (Exception e) {
                e.printStackTrace();
            }
            // no need to set annotations and /P entry
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return new ByteArrayInputStream(baos.toByteArray());
        }
    }
    private static PDRectangle createSignatureRectangle(PDDocument doc, Rectangle2D humanRect)
    {
        float x = (float) humanRect.getX();
        float y = (float) humanRect.getY();
        float width = (float) humanRect.getWidth();
        float height = (float) humanRect.getHeight();
        PDPage page = doc.getPage(0);
        PDRectangle pageRect = page.getCropBox();
        PDRectangle rect = new PDRectangle();
        // signing should be at the same position regardless of page rotation.
        switch (page.getRotation())
        {
            case 90:
                rect.setLowerLeftY(x);
                rect.setUpperRightY(x + width);
                rect.setLowerLeftX(y);
                rect.setUpperRightX(y + height);
                break;
            case 180:
                rect.setUpperRightX(pageRect.getWidth() - x);
                rect.setLowerLeftX(pageRect.getWidth() - x - width);
                rect.setLowerLeftY(y);
                rect.setUpperRightY(y + height);
                break;
            case 270:
                rect.setLowerLeftY(pageRect.getHeight() - x - width);
                rect.setUpperRightY(pageRect.getHeight() - x);
                rect.setLowerLeftX(pageRect.getWidth() - y - height);
                rect.setUpperRightX(pageRect.getWidth() - y);
                break;
            case 0:
            default:

                break;
        }
        return rect;
    }




    public static Map<String,Object> configureSignatureForByteArray(String pass, byte[] barr, String role) throws KeyStoreException, CertificateException, IOException, NoSuchAlgorithmException, UnrecoverableKeyException, OperatorCreationException, CMSException {
        boolean state = false;
        Map<String,Object> signingMap = new HashMap<String, Object>() ;
        String configlocation = CFG_FILE_PATH;

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        sun.security.pkcs11.SunPKCS11 providerPKCS11 = new sun.security.pkcs11.SunPKCS11(configlocation);
        Security.addProvider(providerPKCS11);

        KeyStore keyStore = KeyStore.getInstance("PKCS11");
        keyStore.load(null,pass.toCharArray());
        Enumeration<String> aliases = keyStore.aliases();
        String alias= aliases.nextElement();
        Certificate[] cl=  keyStore.getCertificateChain(alias);
        if(cl.length==0)
        {
            signingMap.put("signProcessFlag",4);
            signingMap.put("signedContent", baos.toByteArray());
            return signingMap;
        }
        PrivateKey pk = (PrivateKey) keyStore.getKey(alias, pass.toCharArray());
        X509Certificate cert = (X509Certificate) cl[0];
        try
        {
            cert.checkValidity();
        } catch (CertificateNotYetValidException e) {
            signingMap.put("signProcessFlag",2);
            signingMap.put("signedContent", baos.toByteArray());
            return signingMap;
        } catch (CertificateExpiredException e) {
            signingMap.put("signProcessFlag",3);
            signingMap.put("signedContent", baos.toByteArray());
            return signingMap;
        }
        X500Principal subjectPrincipal = cert.getSubjectX500Principal();
        X500Name subjectX500name = new X500Name(subjectPrincipal.getName());
        RDN cn = subjectX500name.getRDNs(BCStyle.CN)[0];
        String cnName =IETFUtils.valueToString(cn.getFirst().getValue());

        String s="";
        PDDocument doc = Loader.loadPDF(barr);

        String dest=  TEMP_FILE_PATH;
        File destFile = new File(dest);
        InputStream imageStream = null;
//        ByteArrayInputStream bais = new ByteArrayInputStream(barr);
        BookMark currentBookmark = ExtractBookmarks.extractSpecificBookmarkFromByteArray(barr, role);


        float rectWidth = 130;
        float rectHeight = 50;


        assert currentBookmark != null;
        Rectangle2D humanRect = new Rectangle2D.Float(currentBookmark.getX(),currentBookmark.getY(), rectWidth, rectHeight);
        PDRectangle rect = createSignatureRectangle(doc,humanRect);
        int noOfPages = doc.getNumberOfPages();
        int lastPage = noOfPages -1;
       // String location = "Location-"+"Mumbai";
       // String reason = "Reason-"+"SBI";
        // Setting Up SignatureF
        PDSignature signature = new PDSignature();
        signature.setFilter(PDSignature.FILTER_ADOBE_PPKLITE);
        signature.setSubFilter(PDSignature.SUBFILTER_ADBE_PKCS7_DETACHED);
        System.out.println("At Line 524, Before Setting Signature , cnName="+cnName);
        signature.setName(cnName);
       //// signature.setLocation(location);
        //signature.setReason(reason);

        signature.setSignDate(Calendar.getInstance());

        PDVisibleSigProperties signatureProperties = new PDVisibleSigProperties();
        signatureProperties.signerName(cnName).preferredSize(0).page(1)
                .visualSignEnabled(true);


        SignatureOptions signatureOptions = new SignatureOptions();


        signatureOptions.setVisualSignature(createVisualSignatureTemplate(doc,lastPage,rect,signature));
        signatureOptions.setPage(lastPage);

        try{
            doc.addSignature(signature,signatureOptions);

            ExternalSigningSupport externalSigningSupport = doc.saveIncrementalForExternalSigning(baos);
            byte[] csmSignature = sign(externalSigningSupport.getContent(),cl,pk,cert);
            externalSigningSupport.setSignature(csmSignature);

        }
        catch(Exception e)
        {
            System.out.println(e.getMessage());
        }
        byte[] result= baos.toByteArray();
        if( result.length!=0)
        {
            signingMap.put("signProcessFlag",1);
            signingMap.put("signedContent", result);
        }
        else {
            signingMap.put("signProcessFlag",0);
            signingMap.put("signedContent", result);
        }

        return signingMap;

    }


    public static byte[] extractPDFContent() throws IOException {
        File file = new File(TEMP_FILE_PATH);
        byte[] data;
        try (FileInputStream fis = new FileInputStream(file)) {
            data = new byte[(int) file.length()];
            fis.read(data);
        }
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        data = bos.toByteArray();
        return data;
    }

    public static Map<String,Object> configureSignatureForByteArrayWithWindowsMy(String pass, byte[] barr, String role,String alias) throws UnrecoverableKeyException, OperatorCreationException, CMSException, IOException {
        boolean state = false;
        Map<String,Object> signingMap = new HashMap<String, Object>() ;
        String configlocation = CFG_FILE_PATH;

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
       // sun.security.pkcs11.SunPKCS11 providerPKCS11 = new sun.security.pkcs11.SunPKCS11(configlocation);
        //Security.addProvider(providerPKCS11);

        KeyStore keyStore = null;
        try {
            keyStore = KeyStore.getInstance("WINDOWS-MY");
            keyStore.load(null,pass.toCharArray());
        } catch (KeyStoreException | CertificateException | IOException | NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }

        //Enumeration<String> aliases = keyStore.aliases();
      //  String alias= "ANIL BABU KAYALORATH";
        X509Certificate cert= null;
        Certificate[] cl ;
        try {
            cert = (X509Certificate) keyStore.getCertificate(alias);
            cl = keyStore.getCertificateChain(alias);
        } catch (KeyStoreException e) {

            signingMap.put("signProcessFlag",4);
            signingMap.put("signedContent", baos.toByteArray());
            return signingMap;
        }
        if(cert ==null )
        {
            signingMap.put("signProcessFlag",4);
            signingMap.put("signedContent", baos.toByteArray());
            return signingMap;
        }
        PrivateKey pk = null;
        try {
            pk = (PrivateKey) keyStore.getKey(alias, pass.toCharArray());
        } catch (KeyStoreException | NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }

        try
        {
            cert.checkValidity();
        } catch (CertificateNotYetValidException e) {
            signingMap.put("signProcessFlag",2);
            signingMap.put("signedContent", baos.toByteArray());
            return signingMap;
        } catch (CertificateExpiredException e) {
            signingMap.put("signProcessFlag",3);
            signingMap.put("signedContent", baos.toByteArray());
            return signingMap;
        }
        X500Principal subjectPrincipal = cert.getSubjectX500Principal();
        X500Name subjectX500name = new X500Name(subjectPrincipal.getName());
        RDN cn = subjectX500name.getRDNs(BCStyle.CN)[0];
        String cnName =IETFUtils.valueToString(cn.getFirst().getValue());

        String s="";
        PDDocument doc = null;
        try {
            doc = Loader.loadPDF(barr);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        String dest=  TEMP_FILE_PATH;
        File destFile = new File(dest);
        InputStream imageStream = null;
//        ByteArrayInputStream bais = new ByteArrayInputStream(barr);
        BookMark currentBookmark = ExtractBookmarks.extractSpecificBookmarkFromByteArray(barr, role);


        float rectWidth = 130;
        float rectHeight = 50;


        assert currentBookmark != null;
        Rectangle2D humanRect = new Rectangle2D.Float(currentBookmark.getX(),currentBookmark.getY(), rectWidth, rectHeight);
        PDRectangle rect = createSignatureRectangle(doc,humanRect);
        int noOfPages = doc.getNumberOfPages();
        int lastPage = noOfPages -1;
        // String location = "Location-"+"Mumbai";
        // String reason = "Reason-"+"SBI";
        // Setting Up SignatureF
        PDSignature signature = new PDSignature();
        signature.setFilter(PDSignature.FILTER_ADOBE_PPKLITE);
        signature.setSubFilter(PDSignature.SUBFILTER_ADBE_PKCS7_DETACHED);
        System.out.println("At Line 524, Before Setting Signature , cnName="+cnName);
        signature.setName(cnName);
        //// signature.setLocation(location);
        //signature.setReason(reason);

        signature.setSignDate(Calendar.getInstance());

        PDVisibleSigProperties signatureProperties = new PDVisibleSigProperties();
        signatureProperties.signerName(cnName).preferredSize(0).page(1)
                .visualSignEnabled(true);


        SignatureOptions signatureOptions = new SignatureOptions();


        signatureOptions.setVisualSignature(createVisualSignatureTemplate(doc,lastPage,rect,signature));
        signatureOptions.setPage(lastPage);

        try{
            doc.addSignature(signature,signatureOptions);

            ExternalSigningSupport externalSigningSupport = doc.saveIncrementalForExternalSigning(baos);

            byte[] csmSignature = sign(externalSigningSupport.getContent(),cl,pk,cert);
            externalSigningSupport.setSignature(csmSignature);

        }
        catch(Exception e)
        {
            System.out.println(e.getMessage());
        }
        byte[] result= baos.toByteArray();
        if( result.length!=0)
        {
            signingMap.put("signProcessFlag",1);
            signingMap.put("signedContent", result);
        }
        else {
            signingMap.put("signProcessFlag",0);
            signingMap.put("signedContent", result);
        }

        return signingMap;

    }


    public static void main(String[] args) throws UnrecoverableKeyException, CertificateException, KeyStoreException, IOException, NoSuchAlgorithmException, OperatorCreationException, CMSException {

       String base64String="JVBERi0xLjUKJeLjz9MKMyAwIG9iago8PC9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3RoIDE3OT4+c3RyZWFtCnicrY+9DsIwDIR3P4XHMgBO0xR1LT8DG5ANMZSmDaEqERG8P0klBEhQIcFiS/b5vjMhwyFDQpEJX8sWzpBL4CkKkaFUMJewghiXYRp0hHe1bGG8YMgIZQ3RQB6D9iHpzJ6OOCFPklEavx5St3YaoumhKpvKYW5t0xauCY6E+o3rdue76lJ95omJj8n7gMVVmYt1uP8PMGbCA6kHODPabIw+/QhK/Gc87ftsbb/G3ABMEmxwCmVuZHN0cmVhbQplbmRvYmoKMSAwIG9iago8PC9UYWJzL1MvR3JvdXA8PC9TL1RyYW5zcGFyZW5jeS9UeXBlL0dyb3VwL0NTL0RldmljZVJHQj4+L0NvbnRlbnRzIDMgMCBSL1R5cGUvUGFnZS9SZXNvdXJjZXM8PC9Db2xvclNwYWNlPDwvQ1MvRGV2aWNlUkdCPj4vRm9udDw8L0YxIDIgMCBSPj4+Pi9QYXJlbnQgNCAwIFIvUm90YXRlIDkwL01lZGlhQm94WzAgMCA1OTUgODQyXT4+CmVuZG9iago1IDAgb2JqClsxIDAgUi9YWVogNTcwIDU0NC42MiAwXQplbmRvYmoKNiAwIG9iagpbMSAwIFIvWFlaIDMwIDM1NC42MiAwXQplbmRvYmoKNyAwIG9iagpbMSAwIFIvWFlaIDIxNSA1NDAuNjIgMF0KZW5kb2JqCjggMCBvYmoKWzEgMCBSL1hZWiAwIDYwNSAwXQplbmRvYmoKOSAwIG9iagpbMSAwIFIvWFlaIDQ3MCAzNzQuNjIgMF0KZW5kb2JqCjEyIDAgb2JqCjw8L0Rlc3RbMSAwIFIvWFlaIDI0MCAzMCAwXS9OZXh0IDEzIDAgUi9UaXRsZShDaGVja2VyU2lnbikvUGFyZW50IDExIDAgUj4+CmVuZG9iagoxMyAwIG9iago8PC9EZXN0WzEgMCBSL1hZWiA1MCA1NzAgMF0vTmV4dCAxNCAwIFIvVGl0bGUoQXVkaXRvclNpZ24pL1BhcmVudCAxMSAwIFIvUHJldiAxMiAwIFI+PgplbmRvYmoKMTQgMCBvYmoKPDwvRGVzdFsxIDAgUi9YWVogMjIwIDQ3MCAwXS9UaXRsZShSb1NpZ24pL1BhcmVudCAxMSAwIFIvUHJldiAxMyAwIFI+PgplbmRvYmoKMTEgMCBvYmoKPDwvQ291bnQgLTMvVGl0bGUoKS9QYXJlbnQgMTAgMCBSL0ZpcnN0IDEyIDAgUi9MYXN0IDE0IDAgUj4+CmVuZG9iagoxMCAwIG9iago8PC9UeXBlL091dGxpbmVzL0NvdW50IDEvRmlyc3QgMTEgMCBSL0xhc3QgMTEgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwvU3VidHlwZS9UeXBlMS9UeXBlL0ZvbnQvQmFzZUZvbnQvSGVsdmV0aWNhL0VuY29kaW5nL1dpbkFuc2lFbmNvZGluZz4+CmVuZG9iago0IDAgb2JqCjw8L0tpZHNbMSAwIFJdL1R5cGUvUGFnZXMvQ291bnQgMT4+CmVuZG9iagoxNSAwIG9iago8PC9OYW1lc1soQXVkaXRvclNpZ24pIDUgMCBSKENoZWNrZXJTaWduKSA2IDAgUihEaWdpU2lnbikgNyAwIFIoSlJfUEFHRV9BTkNIT1JfMF8xKSA4IDAgUihSb1NpZ24pIDkgMCBSXT4+CmVuZG9iagoxNiAwIG9iago8PC9EZXN0cyAxNSAwIFI+PgplbmRvYmoKMTcgMCBvYmoKPDwvTmFtZXMgMTYgMCBSL1R5cGUvQ2F0YWxvZy9PdXRsaW5lcyAxMCAwIFIvUGFnZXMgNCAwIFIvVmlld2VyUHJlZmVyZW5jZXM8PC9QcmludFNjYWxpbmcvQXBwRGVmYXVsdD4+Pj4KZW5kb2JqCjE4IDAgb2JqCjw8L0NyZWF0b3IoSmFzcGVyUmVwb3J0cyBMaWJyYXJ5IHZlcnNpb24gNy4wLjAtYjQ3OGZlYWE5YWFiNDM3NWViYTcxZGU3N2I0Y2ExMzhhZDJmNjJhYSkvQ3JlYXRpb25EYXRlKEQ6MjAyNDA5MTYxNTE4NDArMDUnMzAnKS9Qcm9kdWNlcihPcGVuUERGIDEuMy4zMik+PgplbmRvYmoKeHJlZgowIDE5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDI2MSAwMDAwMCBuIAowMDAwMDAxMDg3IDAwMDAwIG4gCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMTE3NSAwMDAwMCBuIAowMDAwMDAwNDY3IDAwMDAwIG4gCjAwMDAwMDA1MDcgMDAwMDAgbiAKMDAwMDAwMDU0NiAwMDAwMCBuIAowMDAwMDAwNTg2IDAwMDAwIG4gCjAwMDAwMDA2MjEgMDAwMDAgbiAKMDAwMDAwMTAxOSAwMDAwMCBuIAowMDAwMDAwOTQyIDAwMDAwIG4gCjAwMDAwMDA2NjEgMDAwMDAgbiAKMDAwMDAwMDc1MiAwMDAwMCBuIAowMDAwMDAwODU1IDAwMDAwIG4gCjAwMDAwMDEyMjYgMDAwMDAgbiAKMDAwMDAwMTM0OSAwMDAwMCBuIAowMDAwMDAxMzgzIDAwMDAwIG4gCjAwMDAwMDE1MDQgMDAwMDAgbiAKdHJhaWxlcgo8PC9JbmZvIDE4IDAgUi9JRCBbPGE5NDc4ODc5MzJiMTFlZWYyNGRlY2E1MTQ2YzRkYjIwPjxhOTQ3ODg3OTMyYjExZWVmMjRkZWNhNTE0NmM0ZGIyMD5dL1Jvb3QgMTcgMCBSL1NpemUgMTk+PgpzdGFydHhyZWYKMTY3NAolJUVPRgo=";
        byte[] barr = Base64.getDecoder().decode(base64String);
        for(int i=0;i<1;i++)
        {  byte[] b= (byte[]) SignAtBookmarks.configureSignatureForByteArray("Password123", barr, "checker").get("signedContent");
            System.out.println(Base64.getEncoder().encodeToString(b).length());
        }

    }
}
