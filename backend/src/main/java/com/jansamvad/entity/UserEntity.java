package com.jansamvad.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class UserEntity extends BaseEntity {

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, name = "password_hash")
    private String passwordHash;

    @Column(name = "mobile_number", nullable = false, unique = true)
    private String mobileNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String ward;

    private String department;

    @OneToMany(mappedBy = "citizen", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<ComplaintEntity> complaints = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<NotificationEntity> notifications = new ArrayList<>();

    @Column(name = "created_at_ts")
    private Instant accountCreatedAt;

    public enum Role {
        CITIZEN, MUNICIPAL_AUTHORITY, FIELD_WORKFORCE, INFLUENCER_REPORTER
    }

    @PrePersist
    @Override
    protected void onCreate() {
        super.onCreate();
        if (accountCreatedAt == null) accountCreatedAt = Instant.now();
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Instant getAccountCreatedAt() { return accountCreatedAt; }
    public void setAccountCreatedAt(Instant accountCreatedAt) { this.accountCreatedAt = accountCreatedAt; }
    public List<ComplaintEntity> getComplaints() { return complaints; }
    public void setComplaints(List<ComplaintEntity> complaints) { this.complaints = complaints; }
    public List<NotificationEntity> getNotifications() { return notifications; }
    public void setNotifications(List<NotificationEntity> notifications) { this.notifications = notifications; }
}
