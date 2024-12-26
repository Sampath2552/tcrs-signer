package com.tcs.sign;

import com.tcs.server.ServerEndPointServlet;
import org.bouncycastle.cms.CMSException;
import org.bouncycastle.operator.OperatorCreationException;

import javax.imageio.ImageIO;
import javax.smartcardio.CardException;
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.IOException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;
import java.util.Arrays;
import java.util.Map;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;

public class LocalSignerLauncher extends JFrame {

    static Logger log = Logger.getLogger(LocalSignerLauncher.class.getName());

    private TrayIcon trayIcon;
    private SystemTray tray;
    private static String password;
    private static byte[] pdfByteContent;
    public  void launchSigner(byte[] pdfContent, String role) throws UnsupportedLookAndFeelException, ClassNotFoundException, InstantiationException, IllegalAccessException, InterruptedException, IOException {

        ImageIcon crsIcon = new ImageIcon(ImageIO.read(Objects.requireNonNull(LocalSignerLauncher.class.getResource("/logo.png"))));
        JFrame frame = new JFrame("CRS-PDF-SIGNER");
        frame.setIconImage(crsIcon.getImage());
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(400, 400);
        frame.setLocationRelativeTo(null);
        frame.setResizable(false);
        frame.setBackground(Color.black);
        log.info("Helloo1");
        CardLayout cardLayout = new CardLayout();
        JPanel mainPanel = new JPanel(cardLayout);
        GridLayout gridLayout = new GridLayout(2, 2);


        // First (Start) Panel
        JPanel startPanel = new JPanel();
        startPanel.setLayout(null);
        startPanel.setBackground(new Color(32, 35, 42));
        JLabel imageLabel = new JLabel(crsIcon);
        imageLabel.setBounds(100, 40, crsIcon.getIconWidth(), crsIcon.getIconHeight());
        JLabel welcomeLabel = new JLabel("Welcome to CRS PDF - Signer");
        welcomeLabel.setFont(new Font("Arial", Font.BOLD, 16));
        welcomeLabel.setHorizontalAlignment(SwingConstants.CENTER);
        welcomeLabel.setVerticalAlignment(SwingConstants.BOTTOM);
        welcomeLabel.setBounds(70, 50 + crsIcon.getIconHeight(), 250, 30);

        final JButton btnStart = new JButton("Start");
        btnStart.setToolTipText("Start the Service");
        startPanel.setLocation(0, 0);
        btnStart.setBounds(127, 305, 130, 30);
        startPanel.add(btnStart);
        startPanel.add(imageLabel);
        startPanel.add(welcomeLabel);
        startPanel.setSize(400, 400);


        log.info("Helloo2");
        // Token Panel
        JPanel tokenPanel = new JPanel();
        tokenPanel.setLayout(null);
//        int currSelected = Integer.parseInt(Utility.getKeyValue("TOKEN")); //Utility.getKeyValue("TOKEN")
        String[] tokenTypeArr = new String[]{"eMudhra", "SafeNet", "Gemalto 32 Bit", "Gemalto 64 Bit", "ePass", "SafeSign", "TRUST KEY", "Belgium eiD MiddleWare", "Aladin eToken", "Safe net I key", "Startkey", "Watchdata PROXkey", "mToken"};
        final JComboBox tokenComboBox = new JComboBox(tokenTypeArr);
        final JLabel label = new JLabel("Select Token:");
        label.setBounds(10, 150, 80, 30);
        label.setHorizontalAlignment(JLabel.CENTER);
        label.setLabelFor(tokenComboBox);
        tokenPanel.add(label);
        tokenPanel.setLocation(0, 0);
        tokenComboBox.setBounds(140, 150, 150, 30);
        tokenPanel.add(tokenComboBox);
        final JButton btnNext = new JButton("Next");
        btnNext.setToolTipText("Navigate to Next Screen");
        btnNext.setBounds(127, 305, 130, 30);
        btnNext.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                try {
                    LocalSignerLauncher.updateSelectedTokenPath((String) tokenComboBox.getItemAt(tokenComboBox.getSelectedIndex()));
                } catch (IOException ex) {
                    log.log(Level.SEVERE, "exception occurred", ex);
                }
                System.out.println(tokenComboBox.getItemAt(tokenComboBox.getSelectedIndex()));
            }
        });
        tokenPanel.add(btnNext);
        tokenPanel.setSize(400, 400);

        log.info("Helloo3");


        // Password Panel
        JPanel passwordPanel = new JPanel();
        passwordPanel.setLayout(null);
        final JLabel passLabel = new JLabel("Enter Password:");
        final JPasswordField passField = new JPasswordField();
        passLabel.setBounds(40, 150, 100, 30);
        passLabel.setHorizontalAlignment(JLabel.CENTER);
        passLabel.setLabelFor(tokenComboBox);
        passwordPanel.add(passLabel);
        passwordPanel.setLocation(0, 0);
        passField.setBounds(150, 150, 150, 30);
        passwordPanel.add(passField);
        final JButton btnValidate = new JButton("Validate Password & Proceed");
        btnValidate.setToolTipText("Navigate to Next Screen");
        btnValidate.setBounds(80, 305, 220, 30);
        final int[] chanceCount = {2};
        passwordPanel.add(btnValidate);
        passwordPanel.setSize(400, 400);
        // Final Panel
        final JPanel finalPanel = new JPanel();
        finalPanel.setLayout(null);
        JLabel finalLabel = new JLabel();
        finalLabel.setBounds(150, 150, 100, 30);
        finalPanel.setLocation(0, 0);
        finalPanel.add(finalLabel);
        finalPanel.setSize(400, 400);

        log.info("Helloo4");
        // loading into main panel
        mainPanel.add(startPanel, "startPanel");
        // Action Listeners For Buttons
        btnStart.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {

                try {
                    if (TokenDetector.detectToken()) {
                        mainPanel.removeAll();
                        mainPanel.add(passwordPanel, "passwordPanel");
                        mainPanel.validate();
                    } else {
                        mainPanel.removeAll();
                        mainPanel.add(tokenPanel);
                        mainPanel.validate();
                    }

                } catch (CardException | IOException ex) {
                    log.log(Level.SEVERE, "exception occurred", ex);
                }


            }
        });

        log.info("Helloo5");
        btnNext.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {


                mainPanel.removeAll();
                mainPanel.add(passwordPanel);

                mainPanel.validate();

            }
        });
        btnValidate.addActionListener(new ActionListener() {

            public void actionPerformed(ActionEvent e) {

                log.info("Helloo6");
                if (chanceCount[0] > 0) {
                    LocalSignerLauncher.password = new String(passField.getPassword());
//                        System.out.println("111111111111");
                    System.out.println(LocalSignerLauncher.password);
//                        System.out.println("222222222222222");


                    try {
                        int flag = SignAtBookmarks.checkPassword(LocalSignerLauncher.password);
                        if (flag == 1)
                        //if(1 == 1)
                        {


                                 pdfByteContent = (byte[]) SignAtBookmarks.configureSignatureForByteArray(LocalSignerLauncher.password, pdfContent , role).get("signedContent");
//                                 System.out.println(Arrays.toString(pdfByteContent));
                                if (pdfByteContent.length != 0) {

                                    JOptionPane.showMessageDialog(LocalSignerLauncher.this, "File Signed Successfully");
                                    ServerEndPointServlet.setPdfOutputContent(pdfByteContent);
//                                    ServerEndPointServlet.messageSender();
                                    frame.dispose();


                                } else {
                                    JOptionPane.showMessageDialog(LocalSignerLauncher.this, "Signing Failed - Please Try Again");
                                    frame.dispose();
//                                    System.exit(0);
                                }



                        } else if (flag == -1) {
                            String s = "Error Loading Token, Verify your token and Try again";
                            JOptionPane.showMessageDialog(LocalSignerLauncher.this, s);


                            frame.dispose();

                            System.out.println("Before Exit");
//                            System.gc();
//                            Utility.updateConfig("name", "none");
//                            Utility.updateConfig("library", "none");
//                            Utility.updateConfig("TOKEN", "none");
//                            System.exit(1);
                            //Runtime.getRuntime().halt(0);
//                            System.exit(0);
                            System.out.println("After Exit");

                        } else if (flag == -2) {
                            String s = "Verify Whether Token dll is installed and check Token Installation Path";
                            JOptionPane.showMessageDialog(LocalSignerLauncher.this, s);

                            frame.dispose();
                            System.gc();
                            Utility.updateConfig("name", "none");
                            Utility.updateConfig("library", "none");
                            Utility.updateConfig("TOKEN", "none");
//                            System.exit(0);


//                                frame.dispose();;
                        } else {

                            String s = "Incorrect Password!!!!!\n" + "Chances Left: " + chanceCount[0] + "\n";
                            chanceCount[0]--;
                            JOptionPane.showMessageDialog(LocalSignerLauncher.this, s);


                        }
                    } catch (KeyStoreException | CertificateException | IOException | NoSuchAlgorithmException |
                             UnrecoverableKeyException | CMSException | OperatorCreationException ex) {
                        ex.printStackTrace();
                        System.out.println(ex.getMessage());
                        log.log(Level.SEVERE, "exception occurred", ex);
                    }
                } else {
                    String s = "Out of Attempts";
                    JOptionPane.showMessageDialog(LocalSignerLauncher.this, s);

                    frame.dispose();
//                    System.exit(0);

                }


            }
        });
        frame.add(mainPanel);
        frame.setVisible(true);
//        System.out.println("Content of PDF in Byte before return" + Arrays.toString(pdfByteContent));
//        while(pdfByteContent ==null) {
//            try{
//                Thread.sleep(3000);
//            } catch (InterruptedException e) {
//                throw new RuntimeException(e);
//            }
//        }
//        return pdfByteContent;
    }


    private static void updateSelectedTokenPath(String input) throws IOException {
        String osName = System.getProperty("os.name");
        boolean flag = true;
        if (flag) {
            if ("eMudhra".equals(input)) {
                Utility.updateConfig("name", "eMudhra");
                Utility.updateConfig("library", "C:\\Windows\\System32\\eTPKCS11.dll");
                Utility.updateConfig("TOKEN", "0");
            } else if ("SafeNet".equals(input)) {
                Utility.updateConfig("name", "SafeNet");
                Utility.updateConfig("library", "C:\\Windows\\System32\\eTPKCS11.dll");

                Utility.updateConfig("TOKEN", "1");
            } else if ("Gemalto 32 Bit".equals(input)) {
                Utility.updateConfig("name", "Gemalto 32 Bit");
                Utility.updateConfig("library", "C:\\Windows\\System32\\IDPrimePKCS11.dll");
                Utility.updateConfig("TOKEN", "2");
            } else if ("Gemalto 64 Bit".equals(input)) {
                Utility.updateConfig("name", "Gemalto 64 Bit");
                Utility.updateConfig("library", "C:\\Windows\\System32\\IDPrimePKCS1164.dll");
                Utility.updateConfig("TOKEN", "3");
            } else if ("ePass".equals(input)) {
                Utility.updateConfig("name", "ePass");
                Utility.updateConfig("library", "C:\\Windows\\System32\\eps2003csp11.dll");
                Utility.updateConfig("TOKEN", "4");
            } else if ("SafeSign".equals(input)) {
                Utility.updateConfig("name", "SafeSign");
                Utility.updateConfig("library", "C:\\Windows\\System32\\aetpkss1.dll");
                Utility.updateConfig("TOKEN", "5");
            } else if ("TRUST KEY".equals(input)) {
                Utility.updateConfig("name", "TRUST KEY");
                Utility.updateConfig("library", "C:\\Windows\\System32\\wdpkcs.dll");
                Utility.updateConfig("TOKEN", "6");
            } else if ("Belgium eiD MiddleWare".equals(input)) {
                Utility.updateConfig("name", "Belgium eiD MiddleWare");
                Utility.updateConfig("library", "C:\\Windows\\System32\\beidpkcs11.dll");
                Utility.updateConfig("TOKEN", "7");
            } else if ("Aladin eToken".equals(input)) {
                Utility.updateConfig("name", "Aladin eToken");
                Utility.updateConfig("library", "C:\\Windows\\System32\\eTPKCS11.dll");
                Utility.updateConfig("TOKEN", "8");
            } else if ("Safe net I key".equals(input)) {
                Utility.updateConfig("name", "Safe net I key");
                Utility.updateConfig("library", "C:\\Windows\\System32\\dkck201.dll");
                Utility.updateConfig("TOKEN", "9");
            } else if ("Startkey".equals(input)) {
                Utility.updateConfig("name", "Startkey");
                Utility.updateConfig("library", "C:\\Windows\\System32\\aetpkss1.dll");
                Utility.updateConfig("TOKEN", "10");
            } else if ("Watchdata PROXkey".equals(input)) {
                Utility.updateConfig("name", "Watchdata PROXkey");
                Utility.updateConfig("library", "C:\\Windows\\System32\\SignatureP11.dll");
                Utility.updateConfig("TOKEN", "11");
            } else if ("mToken".equals(input)) {
                Utility.updateConfig("name", "mToken");
                Utility.updateConfig("library", "C:\\Windows\\System32\\CryptoIDA_pkcs11.dll");
                Utility.updateConfig("TOKEN", "12");
            }
        }


    }


    public static void main(String[] args) throws UnsupportedLookAndFeelException, IOException, ClassNotFoundException, InterruptedException, InstantiationException, IllegalAccessException {
        new LocalSignerLauncher();
    }
}