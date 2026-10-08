package com.jansamvad.dto;

import jakarta.validation.constraints.NotBlank;

public class CampaignRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String description;
    @NotBlank
    private String civicIssue;
    @NotBlank
    private String area;
    private String imageUrl;
    @NotBlank
    private String callToAction;

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
}
