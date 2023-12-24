import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;

public class Proxy {

    public static void main(String[] args) {
        int ClientHttpsPort = 8112;
        int ServerHttpPort = 999;
        try {
            ServerSocket serverSocket = new ServerSocket(ClientHttpsPort);
            System.out.println("Proxy server listening on port " + ClientHttpsPort);
            System.out.println("Forwarding requests to port " + ServerHttpPort);

            while (true) {
                Socket clientSocket = serverSocket.accept();
                Thread thread = new Thread(() -> handleClientRequest(clientSocket, ServerHttpPort));
                thread.start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void handleClientRequest(Socket clientSocket, int ServerHttpPort) {
        // Print client's address
        System.out.println("Client address: " + clientSocket.getInetAddress().getHostAddress());
        try {
            // Establish connection to HTTP server
            Socket serverSocket = new Socket("localhost", ServerHttpPort); // HTTP server's address

            // Read data from client's HTTPS request and forward it to the HTTP server
            InputStream clientInput = clientSocket.getInputStream();
            OutputStream serverOutput = serverSocket.getOutputStream();

            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = clientInput.read(buffer)) != -1) {
                serverOutput.write(buffer, 0, bytesRead);

                // print fowarding request
                System.out.println("fowarding request...");
            }
            serverOutput.flush();

            // print foward message
            System.out.println("Request forwarded from " + clientSocket.getInetAddress().getHostAddress() + " to " + serverSocket.getInetAddress().getHostAddress());

            // Read data from HTTP server's response and forward it back to the client
            InputStream serverInput = serverSocket.getInputStream();
            OutputStream clientOutput = clientSocket.getOutputStream();

            while ((bytesRead = serverInput.read(buffer)) != -1) {
                clientOutput.write(buffer, 0, bytesRead);

                // print fowarding response
                System.out.println("fowarding response...");
            }
            clientOutput.flush();

            // print foward message
            System.out.println("Response forwarded from " + serverSocket.getInetAddress().getHostAddress() + " to " + clientSocket.getInetAddress().getHostAddress());

            // Close streams and sockets
            clientInput.close();
            serverOutput.close();
            serverInput.close();
            clientOutput.close();
            clientSocket.close();
            serverSocket.close();

            // Print message
            System.out.println("Request processed: " + clientSocket.getInetAddress().getHostAddress());

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
