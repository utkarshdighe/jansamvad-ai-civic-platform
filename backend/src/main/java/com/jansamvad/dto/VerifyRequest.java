package com.jansamvad.dto;

import jakarta.validation.constraints.NotNull;

public class VerifyRequest {
    @NotNull
    private String category;
    @NotNull
    private String department;
    @NotNull
    private String priority;

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
