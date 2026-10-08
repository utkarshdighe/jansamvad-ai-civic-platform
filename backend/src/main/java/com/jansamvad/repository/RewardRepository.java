package com.jansamvad.repository;

import com.jansamvad.entity.RewardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RewardRepository extends JpaRepository<RewardEntity, Long> {
    List<RewardEntity> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);
    Optional<RewardEntity> findByCitizenIdAndComplaintIdAndReason(Long citizenId, Long complaintId, String reason);
}
