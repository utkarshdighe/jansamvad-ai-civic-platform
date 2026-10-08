package com.jansamvad.service;

import com.jansamvad.dto.CampaignRequest;
import com.jansamvad.dto.CampaignResponse;
import com.jansamvad.entity.CampaignEntity;
import com.jansamvad.entity.UserEntity;
import com.jansamvad.repository.CampaignRepository;
import com.jansamvad.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final SecurityUtils securityUtils;

    public CampaignService(CampaignRepository campaignRepository, SecurityUtils securityUtils) {
        this.campaignRepository = campaignRepository;
        this.securityUtils = securityUtils;
    }

    public CampaignResponse createCampaign(CampaignRequest request) {
        UserEntity user = securityUtils.getCurrentUser();
        CampaignEntity campaign = new CampaignEntity();
        campaign.setTitle(request.getTitle());
        campaign.setDescription(request.getDescription());
        campaign.setCivicIssue(request.getCivicIssue());
        campaign.setArea(request.getArea());
        campaign.setImageUrl(request.getImageUrl());
        campaign.setCallToAction(request.getCallToAction());
        campaign.setInfluencerId(user.getId());
        campaign.setInfluencerName(user.getFullName());
        campaign.setReferralCode(generateReferralCode());
        campaign.setReach(0);
        campaign.setClicks(0);
        campaign.setNewUsers(0);
        campaign.setComplaintsGenerated(0);
        campaign.setEngagementRate(0.0);
        return toResponse(campaignRepository.save(campaign));
    }

    public List<CampaignResponse> getAllCampaigns() {
        return campaignRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CampaignResponse getCampaign(Long id) {
        CampaignEntity c = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with id: " + id));
        return toResponse(c);
    }

    public CampaignResponse updateCampaign(Long id, CampaignRequest request) {
        UserEntity user = securityUtils.getCurrentUser();
        CampaignEntity c = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with id: " + id));
        if (!c.getInfluencerId().equals(user.getId())
                && user.getRole() != UserEntity.Role.MUNICIPAL_AUTHORITY) {
            throw new IllegalArgumentException("You can only update your own campaigns");
        }
        c.setTitle(request.getTitle());
        c.setDescription(request.getDescription());
        c.setCivicIssue(request.getCivicIssue());
        c.setArea(request.getArea());
        c.setImageUrl(request.getImageUrl());
        c.setCallToAction(request.getCallToAction());
        return toResponse(campaignRepository.save(c));
    }

    private String generateReferralCode() {
        String code;
        do {
            code = "CMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (campaignRepository.existsByReferralCode(code));
        return code;
    }

    private CampaignResponse toResponse(CampaignEntity c) {
        return new CampaignResponse(
                c.getId(), c.getTitle(), c.getDescription(), c.getCivicIssue(), c.getArea(),
                c.getImageUrl(), c.getCallToAction(), c.getReferralCode(), c.getInfluencerId(),
                c.getInfluencerName(), c.getReach(), c.getClicks(), c.getNewUsers(),
                c.getComplaintsGenerated(), c.getEngagementRate(), c.getCreatedAt()
        );
    }
}
