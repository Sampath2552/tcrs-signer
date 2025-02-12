package com.tcs.server;

import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Objects;

public class CRSTray {

    public static void createTray() {
        if (!SystemTray.isSupported()) {
            System.out.println("SystemTray is not supported");
            return;
        }
        else{
            System.out.println("SystemTray is available");
        }
        final PopupMenu popup = new PopupMenu();
        ImageIcon crsIcon = null;
        try {
            crsIcon = new ImageIcon(ImageIO.read(Objects.requireNonNull(CRSTray.class.getResource("/crslogo.png"))));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        JFrame frame = new JFrame("Signing Logs");
        frame.setIconImage(crsIcon.getImage());
        frame.add( new JLabel(" PDF-Signer Logs " ), BorderLayout.NORTH );
        JTextArea ta = new JTextArea();
        TextAreaOutputStream taos = new TextAreaOutputStream( ta, 60 );
        PrintStream ps = new PrintStream( taos );
        System.setOut( ps );
        System.setErr( ps );
        URL imageURL = CRSTray.class.getResource("/crslogo.png");
        System.out.println(imageURL);
        frame.add( new JScrollPane( ta )  );

        frame.pack();

        Image img = null;
        try {
            img = ImageIO.read(imageURL);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        final TrayIcon trayIcon =
                new TrayIcon(img);
        final SystemTray tray = SystemTray.getSystemTray();
        // Create a pop-up menu components
        MenuItem consoleItem = new MenuItem("Console");
        consoleItem.addActionListener(e -> {
            System.out.println("Console Button Clicked");
            frame.setVisible( true );

            frame.setSize(800,600);
            frame.setLocationRelativeTo(null);
        });
        MenuItem exitItem = new MenuItem("Exit");
        exitItem.addActionListener(e -> {
            System.exit(0);
        });
        //Add components to pop-up menu
        popup.add(consoleItem);
        popup.addSeparator();
        popup.add(exitItem);
        trayIcon.setPopupMenu(popup);
        trayIcon.setImageAutoSize(true);
        try {
            tray.add(trayIcon);





        } catch (AWTException e) {
            System.out.println("TrayIcon could not be added.");
        }
    }
}
