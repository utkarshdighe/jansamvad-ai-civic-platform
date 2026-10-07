package com.jansamvad.dto;

import jakarta.validation.constraints.NotBlank;

public class StatusUpdateRequest {
    @NotBlank(message = "Status is required")
    private String status;

    private String taskStatus;
    private String note;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTaskStatus() { return taskStatus; }
    public void setTaskStatus(String taskStatus) { this.taskStatus = taskStatus; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
