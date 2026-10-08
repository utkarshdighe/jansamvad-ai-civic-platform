package com.jansamvad.controller;

import com.jansamvad.dto.*;
import com.jansamvad.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatReplyResponse> sendMessage(@Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(request));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversationResponse>> getConversations() {
        return ResponseEntity.ok(chatService.getConversations());
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<ChatConversationResponse> getConversation(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.getConversation(id));
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        chatService.deleteConversation(id);
        return ResponseEntity.noContent().build();
    }
}
