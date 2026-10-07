package com.jansamvad.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "rewards")
public class RewardEntity extends BaseEntity {

    @Column(nullable = false, name = "citizen_id")
    private Long citizenId;

    @Column(nullable = false)
    private int points;

    @Column(nullable = false)
    private String reason;

    @Column(name = "complaint_id")
    private Long complaintId;

    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
}
