package com.jansamvad.repository;

import com.jansamvad.entity.NotificationEntity;
import com.jansamvad.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByRoleAndUserIdOrderByCreatedAtDesc(UserEntity.Role role, Long userId);
    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
}
