import com.sun.net.httpserver.*;
import javax.net.ssl.*;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;

public class TestHTTPSServer {

    public static void main(String[] args) throws Exception {
        int port = 1000;

        // Load the keystore with SSL certificate
        char[] password = "ThomasNg".toCharArray(); // Replace with your keystore password
        KeyStore keyStore = KeyStore.getInstance("JKS");
        keyStore.load(TestHTTPSServer.class.getResourceAsStream("/keystore.jks"), password);

        // Set up SSL context
        KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        keyManagerFactory.init(keyStore, password);

        TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        trustManagerFactory.init(keyStore);

        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(keyManagerFactory.getKeyManagers(), trustManagerFactory.getTrustManagers(), null);

        // Create HTTPS server
        HttpsServer server = HttpsServer.create(new InetSocketAddress(port), 0);
        server.setHttpsConfigurator(new HttpsConfigurator(sslContext));
        server.createContext("/", new MyHandler());
        server.setExecutor(null); // Use default executor
        server.start();
        System.out.println("Server started on port " + port + " (HTTPS)");
    }

    static class MyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Set CORS headers
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*"); // Change * to your allowed origin
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

            String response = "{\"message\":\"Hello from HTTPS server\"}";
            byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);

            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, responseBytes.length);

            OutputStream outputStream = exchange.getResponseBody();
            outputStream.write(responseBytes);
            outputStream.close();
        }
    }
}
