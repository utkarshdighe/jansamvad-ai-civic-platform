package com.jansamvad.dto;

import java.time.Instant;

public class FieldWorkerResponse {
    private Long id;
    private String name;
    private String department;
    private int activeTasks;
    private int completedTasks;
    private String availability;
    private Long userId;

    public FieldWorkerResponse() {}

    public FieldWorkerResponse(Long id, String name, String department, int activeTasks, int completedTasks, String availability, Long userId) {
        this.id = id;
        this.name = name;
        this.department = department;
        this.activeTasks = activeTasks;
        this.completedTasks = completedTasks;
        this.availability = availability;
        this.userId = userId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public int getActiveTasks() { return activeTasks; }
    public void setActiveTasks(int activeTasks) { this.activeTasks = activeTasks; }
    public int getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(int completedTasks) { this.completedTasks = completedTasks; }
    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
