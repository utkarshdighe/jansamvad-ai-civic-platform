package com.jansamvad.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "influencer_campaigns")
public class CampaignEntity extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, name = "civic_issue")
    private String civicIssue;

    @Column(nullable = false)
    private String area;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false, name = "call_to_action")
    private String callToAction;

    @Column(nullable = false, unique = true, name = "referral_code")
    private String referralCode;

    @Column(nullable = false, name = "influencer_id")
    private Long influencerId;

    @Column(nullable = false, name = "influencer_name")
    private String influencerName;

    @Column(name = "reach")
    private int reach;

    @Column(name = "clicks")
    private int clicks;

    @Column(name = "new_users")
    private int newUsers;

    @Column(name = "complaints_generated")
    private int complaintsGenerated;

    @Column(name = "engagement_rate")
    private double engagementRate;

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
}
