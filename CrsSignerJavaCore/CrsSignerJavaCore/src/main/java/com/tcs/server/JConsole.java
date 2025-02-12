package com.tcs.server;

import com.tcs.server.TextAreaOutputStream;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.io.*;

public class JConsole{
    public static void startConsole(  ) throws InterruptedException  {
        JFrame frame = new JFrame();
        frame.add( new JLabel(" Outout" ), BorderLayout.NORTH );

        JTextArea ta = new JTextArea();
        TextAreaOutputStream taos = new TextAreaOutputStream( ta, 60 );
        PrintStream ps = new PrintStream( taos );
        System.setOut( ps );
        System.setErr( ps );


        frame.add( new JScrollPane( ta )  );

        frame.pack();
        frame.setVisible( true );
        frame.setSize(800,600);


    }
}