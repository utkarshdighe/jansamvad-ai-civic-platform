package com.jansamvad.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatMessageRequest {
    @NotBlank(message = "Message is required")
    private String message;

    private Long conversationId;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
}
