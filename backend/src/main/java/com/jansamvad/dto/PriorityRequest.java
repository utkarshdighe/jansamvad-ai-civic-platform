package com.jansamvad.dto;

import jakarta.validation.constraints.NotNull;

public class PriorityRequest {
    @NotNull(message = "Priority is required")
    private String priority;

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
