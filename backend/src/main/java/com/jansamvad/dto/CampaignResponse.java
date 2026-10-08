package com.jansamvad.dto;

import java.time.Instant;

public class CampaignResponse {
    private Long id;
    private String title;
    private String description;
    private String civicIssue;
    private String area;
    private String imageUrl;
    private String callToAction;
    private String referralCode;
    private Long influencerId;
    private String influencerName;
    private int reach;
    private int clicks;
    private int newUsers;
    private int complaintsGenerated;
    private double engagementRate;
    private Instant createdAt;

    public CampaignResponse() {}

    public CampaignResponse(Long id, String title, String description, String civicIssue, String area,
                            String imageUrl, String callToAction, String referralCode, Long influencerId,
                            String influencerName, int reach, int clicks, int newUsers, int complaintsGenerated,
                            double engagementRate, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.civicIssue = civicIssue;
        this.area = area;
        this.imageUrl = imageUrl;
        this.callToAction = callToAction;
        this.referralCode = referralCode;
        this.influencerId = influencerId;
        this.influencerName = influencerName;
        this.reach = reach;
        this.clicks = clicks;
        this.newUsers = newUsers;
        this.complaintsGenerated = complaintsGenerated;
        this.engagementRate = engagementRate;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCivicIssue() { return civicIssue; }
    public void setCivicIssue(String civicIssue) { this.civicIssue = civicIssue; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getCallToAction() { return callToAction; }
    public void setCallToAction(String callToAction) { this.callToAction = callToAction; }
    public String getReferralCode() { return referralCode; }
    public void setReferralCode(String referralCode) { this.referralCode = referralCode; }
    public Long getInfluencerId() { return influencerId; }
    public void setInfluencerId(Long influencerId) { this.influencerId = influencerId; }
    public String getInfluencerName() { return influencerName; }
    public void setInfluencerName(String influencerName) { this.influencerName = influencerName; }
    public int getReach() { return reach; }
    public void setReach(int reach) { this.reach = reach; }
    public int getClicks() { return clicks; }
    public void setClicks(int clicks) { this.clicks = clicks; }
    public int getNewUsers() { return newUsers; }
    public void setNewUsers(int newUsers) { this.newUsers = newUsers; }
    public int getComplaintsGenerated() { return complaintsGenerated; }
    public void setComplaintsGenerated(int complaintsGenerated) { this.complaintsGenerated = complaintsGenerated; }
    public double getEngagementRate() { return engagementRate; }
    public void setEngagementRate(double engagementRate) { this.engagementRate = engagementRate; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
