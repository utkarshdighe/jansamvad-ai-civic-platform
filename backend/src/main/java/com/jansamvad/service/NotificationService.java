package com.jansamvad.service;

import com.jansamvad.dto.NotificationResponse;
import com.jansamvad.entity.NotificationEntity;
import com.jansamvad.entity.UserEntity;
import com.jansamvad.repository.NotificationRepository;
import com.jansamvad.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SecurityUtils securityUtils;

    public NotificationService(NotificationRepository notificationRepository, SecurityUtils securityUtils) {
        this.notificationRepository = notificationRepository;
        this.securityUtils = securityUtils;
    }

    public List<NotificationResponse> getNotificationsByUser(Long userId) {
        // Enforce ownership: users can only see their own notifications
        UserEntity currentUser = securityUtils.getCurrentUser();
        if (!currentUser.getId().equals(userId)) {
            throw new IllegalArgumentException("You can only view your own notifications");
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public NotificationResponse createNotification(Long userId, UserEntity.Role role, String title, String message, NotificationEntity.NotificationType type) {
        NotificationEntity n = new NotificationEntity();
        n.setUserId(userId);
        n.setRole(role);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setRead(false);
        NotificationEntity saved = notificationRepository.save(n);
        return toResponse(saved);
    }

    public void markAsRead(Long notificationId) {
        UserEntity currentUser = securityUtils.getCurrentUser();
        NotificationEntity n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + notificationId));
        // Ownership check: user can only mark their own notifications as read
        if (!n.getUserId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You can only mark your own notifications as read");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    public void markAllAsRead(Long userId) {
        UserEntity currentUser = securityUtils.getCurrentUser();
        if (!currentUser.getId().equals(userId)) {
            throw new IllegalArgumentException("You can only mark your own notifications as read");
        }
        List<NotificationEntity> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());
        for (NotificationEntity n : unread) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }

    private NotificationResponse toResponse(NotificationEntity n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType() != null ? n.getType().name() : null,
                n.isRead(),
                n.getUserId(),
                n.getRole() != null ? n.getRole().name() : null,
                n.getCreatedAt()
        );
    }
}
