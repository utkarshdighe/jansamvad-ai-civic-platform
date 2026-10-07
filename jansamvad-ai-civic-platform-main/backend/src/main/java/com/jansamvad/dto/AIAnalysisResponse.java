package com.jansamvad.dto;

public class AIAnalysisResponse {
    private String category;
    private String department;
    private String priority;
    private int severity;
    private double confidence;
    private String suggestedAction;
    private String summary;

    public AIAnalysisResponse() {}

    public AIAnalysisResponse(String category, String department, String priority, int severity, double confidence, String suggestedAction, String summary) {
        this.category = category;
        this.department = department;
        this.priority = priority;
        this.severity = severity;
        this.confidence = confidence;
        this.suggestedAction = suggestedAction;
        this.summary = summary;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public int getSeverity() { return severity; }
    public void setSeverity(int severity) { this.severity = severity; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    public String getSuggestedAction() { return suggestedAction; }
    public void setSuggestedAction(String suggestedAction) { this.suggestedAction = suggestedAction; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}
