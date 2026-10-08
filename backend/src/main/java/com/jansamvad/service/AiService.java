package com.jansamvad.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @Value("${app.ai.model:gpt-4o-mini}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String chat(List<ChatMessage> messages, String systemPrompt) {
        if (!isConfigured()) {
            return null;
        }
        try {
            List<Map<String, String>> apiMessages = new ArrayList<>();
            apiMessages.add(Map.of("role", "system", "content", systemPrompt));
            for (ChatMessage msg : messages) {
                apiMessages.add(Map.of("role", msg.role(), "content", msg.content()));
            }

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", apiMessages,
                    "max_tokens", 800,
                    "temperature", 0.7
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && !choices.isEmpty()) {
                    return choices.get(0).path("message").path("content").asText();
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public record ChatMessage(String role, String content) {}
}
