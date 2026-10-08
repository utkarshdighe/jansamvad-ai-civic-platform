package com.jansamvad.dto;

import jakarta.validation.constraints.NotBlank;

public class TaskStatusRequest {
    @NotBlank(message = "Task status is required")
    private String taskStatus;

    public String getTaskStatus() { return taskStatus; }
    public void setTaskStatus(String taskStatus) { this.taskStatus = taskStatus; }
}
