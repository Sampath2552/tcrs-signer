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
//        System.out.println(pageheight);
//        System.out.println(pagewidth);
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
        System.out.println("In Visual Signature ");
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

//                System.out.println(tempFile.getAbsolutePath());
//                System.out.println(tempFile);
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
                cs.setNonStrokingColor(Color.YELLOW);
                cs.addRect(-5000, -5000, 10000, 10000);
                cs.fill();
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
        System.out.println("In Create Signature Rectangle ");
        float x = (float) humanRect.getX();
        float y = (float) humanRect.getY();
        float width = (float) humanRect.getWidth();
        float height = (float) humanRect.getHeight();
        PDPage page = doc.getPage(0);
        PDRectangle pageRect = page.getCropBox();
        PDRectangle rect = new PDRectangle();
        // signing should be at the same position regardless of page rotation.
        System.out.println("Page Rotation="+page.getRotation());
        switch (page.getRotation())
        {
            case 0:
                rect.setLowerLeftY(y+height);
                rect.setUpperRightY(y);
                rect.setLowerLeftX(x);
                rect.setUpperRightX(x+width);
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
       System.out.println(currentBookmark.toString());
        if(currentBookmark==null)
        {
            System.out.println("No Bookmark Present");
        }

        float rectWidth = 130;
        float rectHeight = 50;

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

       String base64String="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dHktSC9EZXNjZW5kYW50Rm9udHNbMjAgMCBSXS9Ub1VuaWNvZGUgMjEgMCBSPj4KZW5kb2JqCjYgMCBvYmoKPDwvS2lkc1sxIDAgUl0vVHlwZS9QYWdlcy9Db3VudCAxL0lUWFQoMi4xLjcpPj4KZW5kb2JqCjIyIDAgb2JqCjw8L05hbWVzWyhBdWRpdG9yU2lnbikgNyAwIFIoQ2hlY2tlclNpZ24pIDggMCBSKEpSX1BBR0VfQU5DSE9SXzBfMSkgOSAwIFJdPj4KZW5kb2JqCjIzIDAgb2JqCjw8L0Rlc3RzIDIyIDAgUj4+CmVuZG9iagoyNCAwIG9iago8PC9OYW1lcyAyMyAwIFIvVHlwZS9DYXRhbG9nL091dGxpbmVzIDEwIDAgUi9QYWdlcyA2IDAgUi9WaWV3ZXJQcmVmZXJlbmNlczw8L1ByaW50U2NhbGluZy9BcHBEZWZhdWx0Pj4+PgplbmRvYmoKMjUgMCBvYmoKPDwvTW9kRGF0ZShEOjIwMjUwMTI3MTc0NDU4KzA1JzMwJykvQ3JlYXRvcihKYXNwZXJSZXBvcnRzIExpYnJhcnkgdmVyc2lvbiA2LjIwLjAtMmJjN2FiNjFjNTZmNDU5ZTgxNzZlYjA1Yzc3MDVlMTQ1Y2Q0MDBhZCkvQ3JlYXRpb25EYXRlKEQ6MjAyNTAxMjcxNzQ0NTgrMDUnMzAnKS9Qcm9kdWNlcihpVGV4dCAyLjEuNyBieSAxVDNYVCk+PgplbmRvYmoKeHJlZgowIDI2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDc1MyAwMDAwMCBuIAowMDAwMDAxNDU1IDAwMDAwIG4gCjAwMDAwMTUzODQgMDAwMDAgbiAKMDAwMDAyOTYyMiAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMjk3NTUgMDAwMDAgbiAKMDAwMDAwMTAxMiAwMDAwMCBuIAowMDAwMDAxMDU0IDAwMDAwIG4gCjAwMDAwMDEwOTIgMDAwMDAgbiAKMDAwMDAwMTM4NyAwMDAwMCBuIAowMDAwMDAxMzEwIDAwMDAwIG4gCjAwMDAwMDExMjcgMDAwMDAgbiAKMDAwMDAwMTIxOCAwMDAwMCBuIAowMDAwMDAxNTQzIDAwMDAwIG4gCjAwMDAwMTQyMzIgMDAwMDAgbiAKMDAwMDAxNDQyNyAwMDAwMCBuIAowMDAwMDE0ODU1IDAwMDAwIG4gCjAwMDAwMTU1MjIgMDAwMDAgbiAKMDAwMDAyODQ4NSAwMDAwMCBuIAowMDAwMDI4NjcxIDAwMDAwIG4gCjAwMDAwMjkwOTQgMDAwMDAgbiAKMDAwMDAyOTgxOCAwMDAwMCBuIAowMDAwMDI5OTExIDAwMDAwIG4gCjAwMDAwMjk5NDUgMDAwMDAgbiAKMDAwMDAzMDA2NiAwMDAwMCBuIAp0cmFpbGVyCjw8L0luZm8gMjUgMCBSL0lEIFs8MzczNGVjYzg3ZjhhZDk5MDAyODY2M2ViZTJlY2JkYTY+PDhlZjlhMDlmYjBhMTY2NGM3Njk1OTEwMDg2YmZhNWY5Pl0vUm9vdCAyNCAwIFIvU2l6ZSAyNj4+CnN0YXJ0eHJlZgozMDI3NgolJUVPRgo=";
        byte[] barr = Base64.getDecoder().decode(base64String);
        System.out.println("In MAIn");
        for(int i=0;i<1;i++)
        {  byte[] b= (byte[]) SignAtBookmarks.configureSignatureForByteArrayWithWindowsMy("Password123", barr, "checker","ANIL BABU KAYALORATH").get("signedContent");
            System.out.println(Base64.getEncoder().encodeToString(b));
            File file = new File("C:\\Users\\ACER\\Desktop\\SignedFiles\\file.pdf");
            FileOutputStream fos = new FileOutputStream(file);
            fos.write(b);
            fos.close();
        }

    }
}
