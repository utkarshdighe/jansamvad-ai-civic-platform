package com.jansamvad.dto;

import java.time.Instant;

public class RewardResponse {
    private Long id;
    private Long citizenId;
    private int points;
    private String reason;
    private Long complaintId;
    private Instant createdAt;

    public RewardResponse() {}

    public RewardResponse(Long id, Long citizenId, int points, String reason, Long complaintId, Instant createdAt) {
        this.id = id;
        this.citizenId = citizenId;
        this.points = points;
        this.reason = reason;
        this.complaintId = complaintId;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
