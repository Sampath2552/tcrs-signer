

package com.tcs.server;


import  org.eclipse.jetty.server.Server;
import org.eclipse.jetty.websocket.api.CloseException;
import org.eclipse.jetty.websocket.server.WebSocketHandler;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;


import javax.swing.*;
import java.io.IOException;


public class JettyServer {
    static JFrame frame = new JFrame();
    static Server server = new Server(2453);



    public static void main(String[] args) throws Exception {

        WebSocketHandler wsHandler = new WebSocketHandler() {
            public void configure(WebSocketServletFactory factory) {
                factory.register(ServerEndPointServlet.class);
                factory.getPolicy().setMaxTextMessageSize(570118950);
            }
        };

        server.setHandler(wsHandler);
        try{
            server.start();
        }
        catch(CloseException ex)
        {
            System.out.println("Server stopped due to timeout");
            JOptionPane.showMessageDialog(frame,"Application Stopped Due to timeout");
            System.exit(0);
        }
         catch(IOException e){
            System.out.println("Server failed to start");

            JOptionPane.showMessageDialog(frame,"Application is already in use");
            System.exit(0);
        }


        server.join();
    }

    public static void stop() {
        try {
            server.stop();

        } catch (Exception ignored) {

        }

    }
}
