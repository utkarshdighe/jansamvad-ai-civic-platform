package com.jansamvad.service;

import com.jansamvad.dto.RewardResponse;
import com.jansamvad.entity.RewardEntity;
import com.jansamvad.entity.UserEntity;
import com.jansamvad.repository.RewardRepository;
import com.jansamvad.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RewardService {

    private final RewardRepository rewardRepository;
    private final SecurityUtils securityUtils;

    public RewardService(RewardRepository rewardRepository, SecurityUtils securityUtils) {
        this.rewardRepository = rewardRepository;
        this.securityUtils = securityUtils;
    }

    public List<RewardResponse> getRewardsByCitizen(Long citizenId) {
        // Enforce ownership: citizens can only see their own rewards
        UserEntity currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == UserEntity.Role.CITIZEN && !currentUser.getId().equals(citizenId)) {
            throw new IllegalArgumentException("You can only view your own rewards");
        }
        return rewardRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public int getTotalPoints(Long citizenId) {
        // Enforce ownership
        UserEntity currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == UserEntity.Role.CITIZEN && !currentUser.getId().equals(citizenId)) {
            throw new IllegalArgumentException("You can only view your own rewards");
        }
        return rewardRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId)
                .stream()
                .mapToInt(RewardEntity::getPoints)
                .sum();
    }

    public RewardEntity addReward(Long citizenId, int points, String reason, Long complaintId) {
        // Prevent duplicate rewards for the same complaint + reason
        if (complaintId != null) {
            var existing = rewardRepository.findByCitizenIdAndComplaintIdAndReason(citizenId, complaintId, reason);
            if (existing.isPresent()) {
                return existing.get();
            }
        }
        RewardEntity reward = new RewardEntity();
        reward.setCitizenId(citizenId);
        reward.setPoints(points);
        reward.setReason(reason);
        reward.setComplaintId(complaintId);
        return rewardRepository.save(reward);
    }

    private RewardResponse toResponse(RewardEntity r) {
        return new RewardResponse(
                r.getId(),
                r.getCitizenId(),
                r.getPoints(),
                r.getReason(),
                r.getComplaintId(),
                r.getCreatedAt()
        );
    }
}
