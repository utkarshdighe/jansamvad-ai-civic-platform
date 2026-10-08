package com.jansamvad.controller;

import com.jansamvad.dto.RewardResponse;
import com.jansamvad.service.RewardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RewardResponse>> getRewardsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(rewardService.getRewardsByCitizen(userId));
    }

    @GetMapping("/user/{userId}/total")
    public ResponseEntity<Map<String, Object>> getTotalPoints(@PathVariable Long userId) {
        int total = rewardService.getTotalPoints(userId);
        return ResponseEntity.ok(Map.of("userId", userId, "totalPoints", total));
    }
}
