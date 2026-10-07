package com.jansamvad.dto;

import java.time.Instant;
import java.util.List;

public class ComplaintResponse {
    private Long id;
    private String complaintNumber;
    private Long citizenId;
    private String citizenName;
    private String title;
    private String description;
    private String category;
    private String location;
    private Double latitude;
    private Double longitude;
    private String priority;
    private String department;
    private String aiCategory;
    private String aiDepartment;
    private String aiPriority;
    private Double aiConfidence;
    private Integer aiSeverity;
    private String aiSuggestedAction;
    private String aiSummary;
    private String status;
    private String taskStatus;
    private Long assignedWorkerId;
    private String assignedWorkerName;
    private String imageUrl;
    private String videoName;
    private String beforePhotoUrl;
    private String afterPhotoUrl;
    private String resolutionNote;
    private int rewardPoints;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;
    private List<TimelineEventDto> timeline;

    public static class TimelineEventDto {
        private String status;
        private Instant timestamp;
        private String actor;
        private String note;

        public TimelineEventDto(String status, Instant timestamp, String actor, String note) {
            this.status = status;
            this.timestamp = timestamp;
            this.actor = actor;
            this.note = note;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
        public String getActor() { return actor; }
        public void setActor(String actor) { this.actor = actor; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getComplaintNumber() { return complaintNumber; }
    public void setComplaintNumber(String complaintNumber) { this.complaintNumber = complaintNumber; }
    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }
    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getAiCategory() { return aiCategory; }
    public void setAiCategory(String aiCategory) { this.aiCategory = aiCategory; }
    public String getAiDepartment() { return aiDepartment; }
    public void setAiDepartment(String aiDepartment) { this.aiDepartment = aiDepartment; }
    public String getAiPriority() { return aiPriority; }
    public void setAiPriority(String aiPriority) { this.aiPriority = aiPriority; }
    public Double getAiConfidence() { return aiConfidence; }
    public void setAiConfidence(Double aiConfidence) { this.aiConfidence = aiConfidence; }
    public Integer getAiSeverity() { return aiSeverity; }
    public void setAiSeverity(Integer aiSeverity) { this.aiSeverity = aiSeverity; }
    public String getAiSuggestedAction() { return aiSuggestedAction; }
    public void setAiSuggestedAction(String aiSuggestedAction) { this.aiSuggestedAction = aiSuggestedAction; }
    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTaskStatus() { return taskStatus; }
    public void setTaskStatus(String taskStatus) { this.taskStatus = taskStatus; }
    public Long getAssignedWorkerId() { return assignedWorkerId; }
    public void setAssignedWorkerId(Long assignedWorkerId) { this.assignedWorkerId = assignedWorkerId; }
    public String getAssignedWorkerName() { return assignedWorkerName; }
    public void setAssignedWorkerName(String assignedWorkerName) { this.assignedWorkerName = assignedWorkerName; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getVideoName() { return videoName; }
    public void setVideoName(String videoName) { this.videoName = videoName; }
    public String getBeforePhotoUrl() { return beforePhotoUrl; }
    public void setBeforePhotoUrl(String beforePhotoUrl) { this.beforePhotoUrl = beforePhotoUrl; }
    public String getAfterPhotoUrl() { return afterPhotoUrl; }
    public void setAfterPhotoUrl(String afterPhotoUrl) { this.afterPhotoUrl = afterPhotoUrl; }
    public String getResolutionNote() { return resolutionNote; }
    public void setResolutionNote(String resolutionNote) { this.resolutionNote = resolutionNote; }
    public int getRewardPoints() { return rewardPoints; }
    public void setRewardPoints(int rewardPoints) { this.rewardPoints = rewardPoints; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public List<TimelineEventDto> getTimeline() { return timeline; }
    public void setTimeline(List<TimelineEventDto> timeline) { this.timeline = timeline; }
}
