package com.tcs.sign;




import java.io.*;
import java.nio.file.FileSystems;
import java.util.Properties;


public class Utility {
//    public static final String TPKCS_11_DLL = File.separator +"eTPKCS11.dll";
    private static Properties config;
    private static final String CFG_FILE_PATH ;
    private static final String CONFIG_FILE_PATH;
//    private static final String LIB_FILE_PATH;

    static {

        CONFIG_FILE_PATH = System.getProperty("user.home") + File.separator + "CRS-Digital-Signer" + File.separator + "config.properties";
//        LIB_FILE_PATH = System.getenv("WINDIR") + File.separator + "System32";
        CFG_FILE_PATH = System.getProperty("user.home") + File.separator + "AppData" + File.separator+ "Roaming" + File.separator + "CRS-Digital-Signer" + File.separator + "config.cfg";
    }

    public Utility() {
    }

    public static void writeLogAndProperty() throws IOException {
        boolean status = false;
        File file = new File(CONFIG_FILE_PATH);
        if (!file.exists()) {



            OutputStream output = new FileOutputStream(CONFIG_FILE_PATH);


            Properties prop = new Properties();
            prop.setProperty("name","epass");
            prop.setProperty("library", "C:\\Windows\\System32\\eTPKCS11.dll");

            prop.setProperty("TOKEN", "0");
            prop.store(output, (String)null);

            ((OutputStream) output).close();


        }


    }
    public static  void writeConfig() throws IOException {
        File file = new File(CONFIG_FILE_PATH);
        config = new Properties();

        config.load(new FileInputStream(file));
        File newFile = new File(CFG_FILE_PATH);
        newFile.createNewFile();
        String name = "name="+config.getProperty("name");

        String library = "library="+config.getProperty("library").replace("\\","\\\\");
        String data=name+"\n"+library;
        FileOutputStream fos = new FileOutputStream(newFile);
        fos.write(data.getBytes());
        fos.flush();
        fos.close();

    }
    public static String removeExtension(String s) {
        String separator = FileSystems.getDefault().getSeparator();
        int lastSeparatorIndex = s.lastIndexOf(separator);
        String filename;
        if (lastSeparatorIndex == -1) {
            filename = s;
        } else {
            filename = s.substring(lastSeparatorIndex + 1);
        }

        int extensionIndex = filename.lastIndexOf(".");
        return extensionIndex == -1 ? filename : filename.substring(0, extensionIndex);
    }

//    public static boolean selectFile() throws IOException, InterruptedException {
//        JFileChooser jfc = new JFileChooser(FileSystemView.getFileSystemView().getHomeDirectory());
//        jfc.setDialogTitle("Select .dll file according to your token");
//        jfc.setAcceptAllFileFilterUsed(false);
//        String[] extensionArray = new String[]{"dll", "so"};
//        FileNameExtensionFilter filter = new FileNameExtensionFilter("Application extension (.dll,.so)", extensionArray);
//        jfc.addChoosableFileFilter(filter);
//        int returnValue = jfc.showOpenDialog((Component)null);
//        if (returnValue == 0) {
//            String filePath = jfc.getSelectedFile().getPath();
//            try{
//                updatePropFile("CRTIFICATE_PATH", filePath);
//            }
//            catch (Exception | ConfigurationException e)
//            {
//                System.out.println("Error: " + e.getMessage());
//            }
//        }
//
//        return false;
//    }
    public static boolean checkForDll() throws IOException {
        boolean status = false;
        String path = getKeyValue("library");
        if (path != null && path != "" && !path.isEmpty()) {
            status = (new File(path.trim())).isFile();
        } else {
            status = (new File("C:\\Windows\\System32\\eTPKCS111.dll")).isFile();
        }

        return status;
    }

    public static String getKeyValue(String Key) throws IOException {
        String value = "";


                InputStream input = new FileInputStream(CONFIG_FILE_PATH);

                    Properties prop = new Properties();
                    prop.load(input);
                    value = prop.getProperty(Key);

                    if (input != null) {
                        ((InputStream)input).close();
                    }






        return value.trim();
    }


//    public static void updatePropFile(String key, String value)   {
//
//            PropertiesConfiguration config = new PropertiesConfiguration(CONFIG_FILE_PATH);
//            config.setProperty(key, value);
//            config.save();
//
//
//    }
    public static Properties getConfig() {
        config = new Properties();

        try {
            config.load(Utility.class.getClassLoader().getResourceAsStream(CONFIG_FILE_PATH));

           System.out.println( config.getProperty("CRTIFICATE_PATH"));
        } catch (IOException e) {

            e.printStackTrace();
            throw new RuntimeException(e);
        }
        return config;
    }
    public static Properties updateConfig(String k, String v) throws IOException {
        config = new Properties();
        File tempFile = new File(CONFIG_FILE_PATH);
        if(!tempFile.exists()) {
            writeLogAndProperty();
        }
        try {
            FileInputStream fis = new FileInputStream(CONFIG_FILE_PATH);

            config.load(fis);
            System.out.println(config.getProperty("library"));
            fis.close();
            config.replace(k,v);
            FileOutputStream fos = new FileOutputStream(CONFIG_FILE_PATH);
            config.store(fos,"");
            fos.close();
            writeConfig();

        } catch (IOException e) {

            e.printStackTrace();
            throw new RuntimeException(e);
        }
        return config;
    }
    public static int deleteConfig()
    {
        boolean deleteFlag= false;
        int flag=0;
        File configFile = new File(CONFIG_FILE_PATH);
        File cfgFile = new File(CFG_FILE_PATH);

        if(configFile.exists()) {
            System.out.println(configFile.getAbsolutePath()+"Exists");
            configFile.delete();
            flag+=1;
        }
        if(cfgFile.exists()) {
            if(cfgFile.delete()) { flag+=1;}

        }
        return flag;
       // return deleteFlag;
    }
}
