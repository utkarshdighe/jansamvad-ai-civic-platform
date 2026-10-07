package com.jansamvad.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "complaint_timeline")
public class TimelineEventEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private ComplaintEntity complaint;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = false)
    private String actor;

    @Column(columnDefinition = "TEXT")
    private String note;

    @PrePersist
    @Override
    protected void onCreate() {
        super.onCreate();
        if (timestamp == null) timestamp = Instant.now();
    }

    public ComplaintEntity getComplaint() { return complaint; }
    public void setComplaint(ComplaintEntity complaint) { this.complaint = complaint; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
