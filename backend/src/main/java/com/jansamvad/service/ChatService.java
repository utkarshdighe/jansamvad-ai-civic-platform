package com.jansamvad.service;

import com.jansamvad.dto.*;
import com.jansamvad.entity.*;
import com.jansamvad.repository.*;
import com.jansamvad.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatService {

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final ComplaintRepository complaintRepository;
    private final SecurityUtils securityUtils;
    private final AiService aiService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter
            .ofPattern("yyyy-MM-dd HH:mm")
            .withZone(ZoneId.systemDefault());

    public ChatService(ChatConversationRepository conversationRepository,
                       ChatMessageRepository messageRepository,
                       ComplaintRepository complaintRepository,
                       SecurityUtils securityUtils,
                       AiService aiService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.complaintRepository = complaintRepository;
        this.securityUtils = securityUtils;
        this.aiService = aiService;
    }

    public ChatReplyResponse sendMessage(ChatMessageRequest request) {
        UserEntity user = securityUtils.getCurrentUser();

        ChatConversationEntity conversation;
        if (request.getConversationId() != null) {
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
            if (!conversation.getUserId().equals(user.getId())) {
                throw new IllegalArgumentException("You can only access your own conversations");
            }
        } else {
            conversation = new ChatConversationEntity();
            conversation.setUserId(user.getId());
            conversation.setTitle(truncate(request.getMessage(), 50));
            conversation = conversationRepository.save(conversation);
        }

        // Save user message
        ChatMessageEntity userMsg = new ChatMessageEntity();
        userMsg.setConversation(conversation);
        userMsg.setSender("user");
        userMsg.setMessage(request.getMessage());
        messageRepository.save(userMsg);
        conversation.getMessages().add(userMsg);

        // Build AI reply
        String reply = buildReply(request.getMessage(), user, conversation);

        // Save AI message
        ChatMessageEntity aiMsg = new ChatMessageEntity();
        aiMsg.setConversation(conversation);
        aiMsg.setSender("assistant");
        aiMsg.setMessage(reply);
        messageRepository.save(aiMsg);
        conversation.getMessages().add(aiMsg);

        // Update conversation timestamp
        conversationRepository.save(conversation);

        return new ChatReplyResponse(conversation.getId(), reply);
    }

    public List<ChatConversationResponse> getConversations() {
        UserEntity user = securityUtils.getCurrentUser();
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(c -> toConversationResponse(c, false))
                .collect(Collectors.toList());
    }

    public ChatConversationResponse getConversation(Long id) {
        UserEntity user = securityUtils.getCurrentUser();
        ChatConversationEntity conv = conversationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        if (!conv.getUserId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only access your own conversations");
        }
        return toConversationResponse(conv, true);
    }

    public void deleteConversation(Long id) {
        UserEntity user = securityUtils.getCurrentUser();
        ChatConversationEntity conv = conversationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        if (!conv.getUserId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only delete your own conversations");
        }
        conversationRepository.delete(conv);
    }

    private String buildReply(String userMessage, UserEntity user, ChatConversationEntity conversation) {
        String lowerMsg = userMessage.toLowerCase().trim();

        // Check if the user is asking about complaint status
        if (isComplaintQuery(lowerMsg)) {
            String complaintInfo = lookupComplaints(userMessage, user);
            if (complaintInfo != null) {
                // If AI is configured, enhance the raw data with a natural response
                if (aiService.isConfigured()) {
                    String systemPrompt = buildSystemPrompt(user);
                    String aiReply = aiService.chat(buildChatHistory(conversation, userMessage), systemPrompt
                            + "\n\nThe user asked about complaints. Here is the real data from the database:\n" + complaintInfo
                            + "\n\nUse ONLY this data to answer. Do not invent complaint IDs, statuses, dates, or worker names.");
                    if (aiReply != null) return aiReply;
                }
                return complaintInfo;
            }
        }

        // If AI is configured, use it with full context
        if (aiService.isConfigured()) {
            String systemPrompt = buildSystemPrompt(user);
            List<AiService.ChatMessage> history = buildChatHistory(conversation, userMessage);
            String aiReply = aiService.chat(history, systemPrompt);
            if (aiReply != null) return aiReply;
        }

        // Fallback: rule-based civic assistant
        return ruleBasedReply(userMessage, user);
    }

    private boolean isComplaintQuery(String msg) {
        return msg.contains("complaint") || msg.contains("status") || msg.contains("track")
                || msg.contains("js-") || msg.contains("js20") || msg.contains("where is")
                || msg.contains("my complaint") || msg.contains("shikayat");
    }

    private String lookupComplaints(String userMessage, UserEntity user) {
        // Extract complaint number if user mentions one like JS-2026-XXXXXX
        String complaintNumber = extractComplaintNumber(userMessage);

        if (complaintNumber != null) {
            // Search by complaint number across all complaints
            for (ComplaintEntity c : complaintRepository.findAllByOrderByCreatedAtDesc()) {
                if (complaintNumber.equalsIgnoreCase(c.getComplaintNumber())) {
                    if (canAccessComplaint(c, user)) {
                        return formatComplaint(c);
                    } else {
                        return "You do not have permission to view complaint " + complaintNumber + ".";
                    }
                }
            }
            return "No complaint found with number " + complaintNumber + ".";
        }

        // No specific complaint number — show user's complaints based on role
        List<ComplaintEntity> complaints;
        if (user.getRole() == UserEntity.Role.CITIZEN) {
            complaints = complaintRepository.findByCitizenIdOrderByCreatedAtDesc(user.getId());
        } else if (user.getRole() == UserEntity.Role.FIELD_WORKFORCE) {
            complaints = complaintRepository.findByAssignedWorkerIdOrderByCreatedAtDesc(user.getId());
        } else {
            complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        }

        if (complaints.isEmpty()) {
            return "You have no complaints on record.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Here are your complaints:\n\n");
        for (int i = 0; i < Math.min(complaints.size(), 5); i++) {
            sb.append(formatComplaintBrief(complaints.get(i)));
            sb.append("\n");
        }
        if (complaints.size() > 5) {
            sb.append("\n...and ").append(complaints.size() - 5).append(" more.");
        }
        return sb.toString();
    }

    private String extractComplaintNumber(String msg) {
        String upper = msg.toUpperCase();
        int idx = upper.indexOf("JS-2026-");
        if (idx >= 0) {
            String sub = upper.substring(idx);
            StringBuilder sb = new StringBuilder();
            for (char c : sub.toCharArray()) {
                if (Character.isLetterOrDigit(c) || c == '-') sb.append(c);
                else break;
            }
            if (sb.length() > 8) return sb.toString();
        }
        return null;
    }

    private boolean canAccessComplaint(ComplaintEntity c, UserEntity user) {
        if (user.getRole() == UserEntity.Role.MUNICIPAL_AUTHORITY) return true;
        if (user.getRole() == UserEntity.Role.CITIZEN) return c.getCitizenId().equals(user.getId());
        if (user.getRole() == UserEntity.Role.FIELD_WORKFORCE)
            return c.getAssignedWorkerId() != null && c.getAssignedWorkerId().equals(user.getId());
        return false;
    }

    private String formatComplaint(ComplaintEntity c) {
        StringBuilder sb = new StringBuilder();
        sb.append("Complaint: ").append(c.getComplaintNumber()).append("\n");
        sb.append("Title: ").append(c.getTitle()).append("\n");
        sb.append("Status: ").append(c.getStatus().name()).append("\n");
        sb.append("Priority: ").append(c.getPriority().name()).append("\n");
        sb.append("Category: ").append(c.getCategory()).append("\n");
        sb.append("Department: ").append(c.getDepartment()).append("\n");
        if (c.getAssignedWorkerName() != null) {
            sb.append("Assigned to: ").append(c.getAssignedWorkerName()).append("\n");
        }
        if (c.getCreatedAt() != null) {
            sb.append("Created: ").append(DATE_FMT.format(c.getCreatedAt())).append("\n");
        }
        if (c.getResolvedAt() != null) {
            sb.append("Resolved: ").append(DATE_FMT.format(c.getResolvedAt())).append("\n");
        }
        if (c.getResolutionNote() != null && !c.getResolutionNote().isBlank()) {
            sb.append("Resolution: ").append(c.getResolutionNote()).append("\n");
        }
        return sb.toString();
    }

    private String formatComplaintBrief(ComplaintEntity c) {
        return String.format("- %s | %s | %s | %s",
                c.getComplaintNumber(), c.getTitle(), c.getStatus().name(), c.getPriority().name());
    }

    private String buildSystemPrompt(UserEntity user) {
        return """
            You are JanSamvad AI, a civic assistant for the JanSamvad municipal platform (Pimpri-Chinchwad Municipal Corporation).
            You help citizens, municipal authorities, field workforce, and influencer reporters.

            Current user: %s (Role: %s, Ward: %s)

            Guidelines:
            - Answer questions about civic issues, complaint processes, departments, and platform guidance.
            - Help users file complaints by guiding them to provide title, description, location, and optional media.
            - When asked about complaint status, use ONLY the database information provided — never invent data.
            - Support English, Hindi, and Marathi. Reply in the user's language where practical.
            - Never expose passwords, tokens, or API keys.
            - Never access another user's private data.
            - Never execute raw SQL or change complaint status by yourself.
            - Do not submit a complaint without explicit user confirmation.
            - Be concise, helpful, and friendly.
            """.formatted(
                user.getFullName(),
                user.getRole().name(),
                user.getWard() != null ? user.getWard() : "N/A"
        );
    }

    private List<AiService.ChatMessage> buildChatHistory(ChatConversationEntity conversation, String currentMessage) {
        List<AiService.ChatMessage> history = new ArrayList<>();
        // Include recent messages for context (last 10)
        List<ChatMessageEntity> all = conversation.getMessages();
        int start = Math.max(0, all.size() - 10);
        for (int i = start; i < all.size(); i++) {
            ChatMessageEntity m = all.get(i);
            String role = "user".equals(m.getSender()) ? "user" : "assistant";
            history.add(new AiService.ChatMessage(role, m.getMessage()));
        }
        return history;
    }

    private String ruleBasedReply(String userMessage, UserEntity user) {
        String msg = userMessage.toLowerCase().trim();

        // Greetings
        if (msg.contains("hello") || msg.contains("hi") || msg.contains("hey") || msg.contains("namaste") || msg.contains("namaskar")) {
            return "Hello! I'm JanSamvad AI, your civic assistant. I can help you:\n\n" +
                   "1. File a new complaint\n2. Track your complaint status\n3. Learn about departments and complaint categories\n4. Understand the complaint process\n\n" +
                   "How can I help you today?";
        }

        // Complaint filing guidance
        if (msg.contains("report") || msg.contains("file") || msg.contains("register") || msg.contains("submit") || msg.contains("shikayat")) {
            return "To file a complaint, please provide:\n\n" +
                   "1. **Title** — a short summary (e.g., 'Pothole on Main Road')\n2. **Description** — detailed description of the issue\n" +
                   "3. **Location** — address or area\n4. **Photo/Video** (optional) — attach evidence\n\n" +
                   "You can file a complaint from your dashboard by clicking 'New Complaint'. Would you like guidance on which category to choose?";
        }

        // Complaint categories
        if (msg.contains("category") || msg.contains("categories") || msg.contains("type")) {
            return "JanSamvad supports these complaint categories:\n\n" +
                   "- Road Damage (potholes, broken footpaths)\n- Waste Management (garbage collection, dumping)\n" +
                   "- Street Lighting (non-functional lights)\n- Water Supply (leaks, low pressure)\n" +
                   "- Sanitation (drainage, sewage)\n- Tree & Garden (fallen trees, maintenance)\n- Encroachment (illegal occupation)\n\n" +
                   "Each category is routed to the appropriate municipal department automatically.";
        }

        // Departments
        if (msg.contains("department") || msg.contains("departments")) {
            return "Municipal departments handle different complaint types:\n\n" +
                   "- Public Works Dept — roads, footpaths, infrastructure\n- Solid Waste Management — garbage, sanitation\n" +
                   "- Electrical Dept — street lighting\n- Water Dept — water supply, pipelines\n" +
                   "- Parks & Gardens — trees, green spaces\n- Encroachment Dept — illegal structures\n\n" +
                   "Complaints are automatically routed to the correct department based on category.";
        }

        // Complaint process
        if (msg.contains("process") || msg.contains("how") || msg.contains("workflow") || msg.contains("status mean")) {
            return "The complaint process has these stages:\n\n" +
                   "1. **Registered** — Complaint submitted by citizen\n2. **Verified** — Municipal authority reviews and verifies\n" +
                   "3. **Assigned** — Field workforce is assigned\n4. **In Progress** — Work is underway\n" +
                   "5. **Resolved** — Issue fixed and verified\n6. **Rejected** — Complaint declined (with reason)\n\n" +
                   "You earn reward points at each stage: 50 for submission, 10 for verification, 20 for resolution.";
        }

        // Track complaint
        if (msg.contains("track") || msg.contains("status") || msg.contains("where")) {
            return "I can look up your complaints! You can:\n\n" +
                   "1. Ask 'What is my complaint status?' to see all your complaints\n" +
                   "2. Mention a specific complaint number like 'JS-2026-000123' for details\n\n" +
                   "What would you like to know?";
        }

        // Rewards
        if (msg.contains("reward") || msg.contains("points") || msg.contains("badge")) {
            return "You earn reward points for civic participation:\n\n" +
                   "- 50 points: Complaint submitted\n- 10 points: Complaint verified\n" +
                   "- 20 points: Complaint resolved\n\n" +
                   "Check your total points and reward history in the Rewards section of your dashboard.";
        }

        // Help
        if (msg.contains("help") || msg.contains("what can you do")) {
            return "I'm JanSamvad AI. I can help with:\n\n" +
                   "- Filing complaints and choosing categories\n- Tracking complaint status\n" +
                   "- Understanding departments and the complaint process\n- Reward points information\n" +
                   "- Civic questions about Pimpri-Chinchwad Municipal Corporation\n\n" +
                   "What would you like to know?";
        }

        // Language support
        if (msg.contains("hindi") || msg.contains("marathi") || msg.contains("bhasha")) {
            return "I can respond in English, Hindi, and Marathi. Please ask your question in any of these languages.\n\n" +
                   "मैं हिंदी, मराठी और अंग्रेजी में जवाब दे सकता हूं।\nमी इंग्रजी, हिंदी आणि मराठीत उत्तर देऊ शकतो.";
        }

        // Default
        return "I'm JanSamvad AI, your civic assistant. I can help you file complaints, track their status, " +
               "learn about departments, and understand the complaint process. " +
               "You can ask me things like:\n\n" +
               "- 'I want to report a pothole'\n- 'What is my complaint status?'\n- 'What departments handle what?'\n" +
               "- 'How do I file a complaint?'\n\nWhat would you like help with?";
    }

    private String truncate(String s, int max) {
        if (s == null) return "New Conversation";
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }

    private ChatConversationResponse toConversationResponse(ChatConversationEntity c, boolean includeMessages) {
        List<ChatMessageResponse> messages = includeMessages
                ? c.getMessages().stream().map(this::toMessageResponse).collect(Collectors.toList())
                : List.of();
        return new ChatConversationResponse(c.getId(), c.getUserId(), c.getTitle(), c.getCreatedAt(), c.getUpdatedAt(), messages);
    }

    private ChatMessageResponse toMessageResponse(ChatMessageEntity m) {
        return new ChatMessageResponse(m.getId(), m.getConversation().getId(), m.getSender(), m.getMessage(), m.getCreatedAt());
    }
}
