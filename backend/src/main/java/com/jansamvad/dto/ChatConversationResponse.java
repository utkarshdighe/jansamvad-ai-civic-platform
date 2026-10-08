package com.jansamvad.dto;

import java.time.Instant;
import java.util.List;

public class ChatConversationResponse {
    private Long id;
    private Long userId;
    private String title;
    private Instant createdAt;
    private Instant updatedAt;
    private List<ChatMessageResponse> messages;

    public ChatConversationResponse() {}

    public ChatConversationResponse(Long id, Long userId, String title, Instant createdAt, Instant updatedAt, List<ChatMessageResponse> messages) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.messages = messages;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public List<ChatMessageResponse> getMessages() { return messages; }
    public void setMessages(List<ChatMessageResponse> messages) { this.messages = messages; }
}
