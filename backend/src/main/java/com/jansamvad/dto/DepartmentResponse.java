package com.jansamvad.dto;

import java.time.Instant;

public class DepartmentResponse {
    private Long id;
    private String name;
    private String head;
    private int totalComplaints;
    private int resolved;
    private int inProgress;
    private Instant createdAt;

    public DepartmentResponse() {}

    public DepartmentResponse(Long id, String name, String head, int totalComplaints, int resolved, int inProgress, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.head = head;
        this.totalComplaints = totalComplaints;
        this.resolved = resolved;
        this.inProgress = inProgress;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getHead() { return head; }
    public void setHead(String head) { this.head = head; }
    public int getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(int totalComplaints) { this.totalComplaints = totalComplaints; }
    public int getResolved() { return resolved; }
    public void setResolved(int resolved) { this.resolved = resolved; }
    public int getInProgress() { return inProgress; }
    public void setInProgress(int inProgress) { this.inProgress = inProgress; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
