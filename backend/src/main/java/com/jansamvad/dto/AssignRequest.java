package com.jansamvad.dto;

import jakarta.validation.constraints.NotNull;

public class AssignRequest {
    @NotNull(message = "Worker ID is required")
    private Long workerId;

    public Long getWorkerId() { return workerId; }
    public void setWorkerId(Long workerId) { this.workerId = workerId; }
}
