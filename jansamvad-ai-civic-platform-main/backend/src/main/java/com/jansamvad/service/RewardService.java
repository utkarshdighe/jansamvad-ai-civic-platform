package com.jansamvad.service;

import com.jansamvad.entity.RewardEntity;
import com.jansamvad.repository.RewardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RewardService {

    private final RewardRepository rewardRepository;

    public RewardService(RewardRepository rewardRepository) {
        this.rewardRepository = rewardRepository;
    }

    public List<RewardEntity> getRewardsByCitizen(Long citizenId) {
        return rewardRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
    }

    public RewardEntity addReward(Long citizenId, int points, String reason, Long complaintId) {
        RewardEntity reward = new RewardEntity();
        reward.setCitizenId(citizenId);
        reward.setPoints(points);
        reward.setReason(reason);
        reward.setComplaintId(complaintId);
        return rewardRepository.save(reward);
    }

    public int getTotalPoints(Long citizenId) {
        return rewardRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId)
                .stream()
                .mapToInt(RewardEntity::getPoints)
                .sum();
    }
}
