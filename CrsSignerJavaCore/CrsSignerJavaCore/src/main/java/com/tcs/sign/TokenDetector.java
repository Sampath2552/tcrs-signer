package com.tcs.sign;



import javax.smartcardio.CardException;
import javax.smartcardio.CardTerminal;
import javax.smartcardio.TerminalFactory;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.List;
import java.util.Properties;

public class TokenDetector {
       private static final String CFG_FILE_PATH=System.getProperty("user.home") + File.separator + "AppData" +File.separator + "Roaming" + File.separator +"TCRS-Signer" + File.separator + "config.cfg";;
    public static boolean detectToken() throws CardException, IOException {
        File tempFile = new File(CFG_FILE_PATH);
        if(!tempFile.exists()){
            return false;
        }
        TerminalFactory factory = TerminalFactory.getDefault();
        List<CardTerminal> terminals = factory.terminals().list();
        for (CardTerminal terminal : terminals) {
            System.out.println(terminal);
        }
        FileReader fileReader = null;
        fileReader = new FileReader(CFG_FILE_PATH);

        Properties config = new Properties();
        config.load(fileReader);
        String tokenName = config.getProperty("name");
        System.out.println(tokenName);
        boolean flag=false;
        for(int i=0;i<terminals.size();i++){
            if(terminals.get(i).getName().contains(tokenName)){
                System.out.println(terminals.get(i));
                System.out.println(i);
                flag=true;
                break;
            }
        }
        return flag;
    }
    public static void getTokenDetails()

    {
        TerminalFactory factory = TerminalFactory.getDefault();
        List<CardTerminal> terminals = null;
        try {
            terminals = factory.terminals().list();
            for (CardTerminal terminal : terminals) {
                System.out.println(terminal.getName());

            }
        } catch (CardException e) {
            System.out.println("0");
        }

    }

    public static void main(String[] args) {
       getTokenDetails();
    }
}
