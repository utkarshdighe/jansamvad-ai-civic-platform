package com.jansamvad.dto;

import java.time.Instant;

public class ComplaintMediaResponse {
    private Long id;
    private Long complaintId;
    private String filePath;
    private String mediaType;
    private String originalName;
    private long fileSize;
    private Instant createdAt;

    public ComplaintMediaResponse() {}

    public ComplaintMediaResponse(Long id, Long complaintId, String filePath, String mediaType, String originalName, long fileSize, Instant createdAt) {
        this.id = id;
        this.complaintId = complaintId;
        this.filePath = filePath;
        this.mediaType = mediaType;
        this.originalName = originalName;
        this.fileSize = fileSize;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }
    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
