package com.jansamvad.controller;

import com.jansamvad.dto.DashboardResponse;
import com.jansamvad.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/citizen")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<DashboardResponse> getCitizenDashboard() {
        return ResponseEntity.ok(dashboardService.getCitizenDashboard());
    }

    @GetMapping("/authority")
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<DashboardResponse> getAuthorityDashboard() {
        return ResponseEntity.ok(dashboardService.getAuthorityDashboard());
    }

    @GetMapping("/workforce")
    @PreAuthorize("hasRole('FIELD_WORKFORCE')")
    public ResponseEntity<DashboardResponse> getWorkforceDashboard() {
        return ResponseEntity.ok(dashboardService.getWorkforceDashboard());
    }

    @GetMapping("/influencer")
    @PreAuthorize("hasRole('INFLUENCER_REPORTER')")
    public ResponseEntity<DashboardResponse> getInfluencerDashboard() {
        return ResponseEntity.ok(dashboardService.getInfluencerDashboard());
    }
}
