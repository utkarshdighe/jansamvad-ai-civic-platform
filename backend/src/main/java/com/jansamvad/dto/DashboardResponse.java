package com.jansamvad.dto;

import java.util.List;
import java.util.Map;

public class DashboardResponse {
    private Map<String, Long> statusCounts;
    private long totalComplaints;
    private long resolvedComplaints;
    private long pendingComplaints;
    private long activeTasks;
    private int rewardPoints;
    private List<ComplaintResponse> recentComplaints;
    private List<FieldWorkerResponse> workers;
    private List<DepartmentResponse> departments;
    private List<CampaignResponse> campaigns;
    private Map<String, Long> priorityCounts;

    public Map<String, Long> getStatusCounts() { return statusCounts; }
    public void setStatusCounts(Map<String, Long> statusCounts) { this.statusCounts = statusCounts; }
    public long getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(long totalComplaints) { this.totalComplaints = totalComplaints; }
    public long getResolvedComplaints() { return resolvedComplaints; }
    public void setResolvedComplaints(long resolvedComplaints) { this.resolvedComplaints = resolvedComplaints; }
    public long getPendingComplaints() { return pendingComplaints; }
    public void setPendingComplaints(long pendingComplaints) { this.pendingComplaints = pendingComplaints; }
    public long getActiveTasks() { return activeTasks; }
    public void setActiveTasks(long activeTasks) { this.activeTasks = activeTasks; }
    public int getRewardPoints() { return rewardPoints; }
    public void setRewardPoints(int rewardPoints) { this.rewardPoints = rewardPoints; }
    public List<ComplaintResponse> getRecentComplaints() { return recentComplaints; }
    public void setRecentComplaints(List<ComplaintResponse> recentComplaints) { this.recentComplaints = recentComplaints; }
    public List<FieldWorkerResponse> getWorkers() { return workers; }
    public void setWorkers(List<FieldWorkerResponse> workers) { this.workers = workers; }
    public List<DepartmentResponse> getDepartments() { return departments; }
    public void setDepartments(List<DepartmentResponse> departments) { this.departments = departments; }
    public List<CampaignResponse> getCampaigns() { return campaigns; }
    public void setCampaigns(List<CampaignResponse> campaigns) { this.campaigns = campaigns; }
    public Map<String, Long> getPriorityCounts() { return priorityCounts; }
    public void setPriorityCounts(Map<String, Long> priorityCounts) { this.priorityCounts = priorityCounts; }
}
