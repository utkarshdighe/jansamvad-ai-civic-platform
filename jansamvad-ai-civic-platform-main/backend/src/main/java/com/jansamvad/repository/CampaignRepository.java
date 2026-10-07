package com.jansamvad.repository;

import com.jansamvad.entity.CampaignEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CampaignRepository extends JpaRepository<CampaignEntity, Long> {
    List<CampaignEntity> findByInfluencerIdOrderByCreatedAtDesc(Long influencerId);
    boolean existsByReferralCode(String referralCode);
}
