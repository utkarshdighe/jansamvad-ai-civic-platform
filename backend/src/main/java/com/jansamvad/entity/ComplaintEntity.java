package com.jansamvad.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
public class ComplaintEntity extends BaseEntity {

    @Column(nullable = false, unique = true, name = "complaint_number")
    private String complaintNumber;

    @Column(nullable = false, name = "citizen_id")
    private Long citizenId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", insertable = false, updatable = false)
    private UserEntity citizen;

    @Column(nullable = false, name = "citizen_name")
    private String citizenName;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    private String location;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    private String department;

    @Column(name = "ai_category")
    private String aiCategory;

    @Column(name = "ai_department")
    private String aiDepartment;

    @Enumerated(EnumType.STRING)
    @Column(name = "ai_priority")
    private Priority aiPriority;

    @Column(name = "ai_confidence")
    private Double aiConfidence;

    @Column(name = "ai_severity")
    private Integer aiSeverity;

    @Column(name = "ai_suggested_action", columnDefinition = "TEXT")
    private String aiSuggestedAction;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_status")
    private TaskStatus taskStatus;

    @Column(name = "assigned_worker_id")
    private Long assignedWorkerId;

    @Column(name = "assigned_worker_name")
    private String assignedWorkerName;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "video_name")
    private String videoName;

    @Column(name = "before_photo_url")
    private String beforePhotoUrl;

    @Column(name = "after_photo_url")
    private String afterPhotoUrl;

    @Column(name = "resolution_note", columnDefinition = "TEXT")
    private String resolutionNote;

    @Column(name = "reward_points")
    private int rewardPoints;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp ASC")
    private List<TimelineEventEntity> timeline = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComplaintMediaEntity> media = new ArrayList<>();

    public enum Priority { LOW, MEDIUM, HIGH, CRITICAL }
    public enum Status { REGISTERED, AI_ANALYZED, VERIFIED, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED }
    public enum TaskStatus { ASSIGNED, ACCEPTED, IN_PROGRESS, WORK_COMPLETED, RESOLVED }

    public String getComplaintNumber() { return complaintNumber; }
    public void setComplaintNumber(String complaintNumber) { this.complaintNumber = complaintNumber; }
    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }
    public UserEntity getCitizen() { return citizen; }
    public void setCitizen(UserEntity citizen) { this.citizen = citizen; }
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
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getAiCategory() { return aiCategory; }
    public void setAiCategory(String aiCategory) { this.aiCategory = aiCategory; }
    public String getAiDepartment() { return aiDepartment; }
    public void setAiDepartment(String aiDepartment) { this.aiDepartment = aiDepartment; }
    public Priority getAiPriority() { return aiPriority; }
    public void setAiPriority(Priority aiPriority) { this.aiPriority = aiPriority; }
    public Double getAiConfidence() { return aiConfidence; }
    public void setAiConfidence(Double aiConfidence) { this.aiConfidence = aiConfidence; }
    public Integer getAiSeverity() { return aiSeverity; }
    public void setAiSeverity(Integer aiSeverity) { this.aiSeverity = aiSeverity; }
    public String getAiSuggestedAction() { return aiSuggestedAction; }
    public void setAiSuggestedAction(String aiSuggestedAction) { this.aiSuggestedAction = aiSuggestedAction; }
    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public TaskStatus getTaskStatus() { return taskStatus; }
    public void setTaskStatus(TaskStatus taskStatus) { this.taskStatus = taskStatus; }
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
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public List<TimelineEventEntity> getTimeline() { return timeline; }
    public void setTimeline(List<TimelineEventEntity> timeline) { this.timeline = timeline; }
    public List<ComplaintMediaEntity> getMedia() { return media; }
    public void setMedia(List<ComplaintMediaEntity> media) { this.media = media; }
}
