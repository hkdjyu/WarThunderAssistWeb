package deprecated;
import com.sun.net.httpserver.*;
import javax.net.ssl.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.net.http.*;
import java.util.HashMap;
import java.util.Map;

public class TestHTTPSServer {

    private static final int SERVER_PORT = 8111;
    private static final Map<Integer, String> ENDPOINTS = Map.of(
            8112, "/state",
            8113, "/indicators",
            8114, "/map_obj.json",
            8115, "/map_info.json"
    );

    private static final SSLContext sslContext;

    static {
        try {
            char[] password = "ThomasNg".toCharArray();
            KeyStore keyStore = KeyStore.getInstance("JKS");
            keyStore.load(TestHTTPSServer.class.getResourceAsStream("/keystore.jks"), password);

            KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
            keyManagerFactory.init(keyStore, password);

            TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            trustManagerFactory.init(keyStore);

            sslContext = SSLContext.getInstance("TLS");
            sslContext.init(keyManagerFactory.getKeyManagers(), trustManagerFactory.getTrustManagers(), null);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize SSL context", e);
        }
    }

    public static void main(String[] args) throws IOException {
        Executor executor = Executors.newFixedThreadPool(ENDPOINTS.size());

        for (Map.Entry<Integer, String> entry : ENDPOINTS.entrySet()) {
            int httpsPort = entry.getKey();
            String endpoint = entry.getValue();
            startServer(httpsPort, endpoint, executor);
        }
    }

    private static void startServer(int httpsPort, String endpoint, Executor executor) throws IOException {
        HttpsServer server = HttpsServer.create(new InetSocketAddress(httpsPort), 0);
        server.setHttpsConfigurator(new HttpsConfigurator(sslContext));
        server.createContext("/", new MyHandler(endpoint));
        server.setExecutor(executor);
        server.start();
        System.out.println("Server started on port " + httpsPort + " (HTTPS) forwarding from endpoint " + endpoint);
    }

    static class MyHandler implements HttpHandler {
        private final String endpoint;
        private final HttpClient httpClient;

        public MyHandler(String endpoint) {
            this.endpoint = endpoint;
            this.httpClient = HttpClient.newBuilder()
                    .version(HttpClient.Version.HTTP_1_1)
                    .build();
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Set CORS headers
            setCorsHeaders(exchange);

            byte[] responseData;
            try {
                responseData = fetchDataFromHTTPServer(endpoint);
            } catch (Exception e) {
                responseData = "<html><body><h1>Error occurred</h1></body></html>"
                        .getBytes(StandardCharsets.UTF_8);
                e.printStackTrace();
            }

            sendResponse(exchange, responseData);
        }

        private void setCorsHeaders(HttpExchange exchange) {
            Headers headers = exchange.getResponseHeaders();
            headers.set("Access-Control-Allow-Origin", "*");
            headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        }

        private void sendResponse(HttpExchange exchange, byte[] responseData) throws IOException {
            exchange.getResponseHeaders().set("Content-Type", "text/html");
            exchange.sendResponseHeaders(200, responseData.length);
            try (OutputStream outputStream = exchange.getResponseBody()) {
                outputStream.write(responseData);
            }
        }

        private byte[] fetchDataFromHTTPServer(String endpoint) throws IOException, InterruptedException {
            int serverPort = SERVER_PORT;
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:" + serverPort + endpoint))
                    .GET()
                    .build();

            HttpResponse<byte[]> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofByteArray());
            return httpResponse.body();
        }
    }
}
