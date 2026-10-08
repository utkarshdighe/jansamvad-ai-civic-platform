package com.jansamvad.dto;

import java.time.Instant;

public class ChatMessageResponse {
    private Long id;
    private Long conversationId;
    private String sender;
    private String message;
    private Instant createdAt;

    public ChatMessageResponse() {}

    public ChatMessageResponse(Long id, Long conversationId, String sender, String message, Instant createdAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.sender = sender;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
