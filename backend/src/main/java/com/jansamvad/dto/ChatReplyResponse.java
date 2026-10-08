package com.jansamvad.dto;

public class ChatReplyResponse {
    private Long conversationId;
    private String reply;

    public ChatReplyResponse(Long conversationId, String reply) {
        this.conversationId = conversationId;
        this.reply = reply;
    }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
}
