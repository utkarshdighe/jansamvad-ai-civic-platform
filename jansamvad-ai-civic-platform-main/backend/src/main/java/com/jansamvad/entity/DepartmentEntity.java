package com.jansamvad.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "departments")
public class DepartmentEntity extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    private String head;

    @Column(name = "total_complaints")
    private int totalComplaints;

    private int resolved;

    @Column(name = "in_progress")
    private int inProgress;

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
}
