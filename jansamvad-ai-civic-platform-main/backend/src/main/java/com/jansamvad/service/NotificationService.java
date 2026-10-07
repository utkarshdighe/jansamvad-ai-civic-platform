package com.jansamvad.service;

import com.jansamvad.dto.NotificationResponse;
import com.jansamvad.entity.NotificationEntity;
import com.jansamvad.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationResponse> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public NotificationResponse createNotification(Long userId, NotificationEntity.Role role, String title, String message, NotificationEntity.NotificationType type) {
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
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
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
