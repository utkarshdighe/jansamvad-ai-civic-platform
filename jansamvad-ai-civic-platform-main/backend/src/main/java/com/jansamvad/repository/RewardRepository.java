package com.jansamvad.repository;

import com.jansamvad.entity.RewardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RewardRepository extends JpaRepository<RewardEntity, Long> {
    List<RewardEntity> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);
}
