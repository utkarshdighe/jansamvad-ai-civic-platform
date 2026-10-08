package com.jansamvad.repository;

import com.jansamvad.entity.ChatConversationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatConversationRepository extends JpaRepository<ChatConversationEntity, Long> {
    List<ChatConversationEntity> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
