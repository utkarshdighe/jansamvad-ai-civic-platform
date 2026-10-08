package com.jansamvad.controller;

import com.jansamvad.dto.CampaignRequest;
import com.jansamvad.dto.CampaignResponse;
import com.jansamvad.service.CampaignService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @PostMapping
    @PreAuthorize("hasRole('INFLUENCER_REPORTER')")
    public ResponseEntity<CampaignResponse> createCampaign(@Valid @RequestBody CampaignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(campaignService.createCampaign(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('INFLUENCER_REPORTER') or hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<List<CampaignResponse>> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('INFLUENCER_REPORTER') or hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<CampaignResponse> getCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaign(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INFLUENCER_REPORTER') or hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<CampaignResponse> updateCampaign(@PathVariable Long id, @Valid @RequestBody CampaignRequest request) {
        return ResponseEntity.ok(campaignService.updateCampaign(id, request));
    }
}
