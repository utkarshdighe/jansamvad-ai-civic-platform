package com.jansamvad.service;

import com.jansamvad.dto.*;
import com.jansamvad.entity.*;
import com.jansamvad.repository.*;
import com.jansamvad.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class DashboardService {

    private final ComplaintRepository complaintRepository;
    private final FieldWorkerRepository fieldWorkerRepository;
    private final DepartmentRepository departmentRepository;
    private final CampaignRepository campaignRepository;
    private final RewardRepository rewardRepository;
    private final SecurityUtils securityUtils;
    private final ComplaintService complaintService;

    public DashboardService(ComplaintRepository complaintRepository,
                            FieldWorkerRepository fieldWorkerRepository,
                            DepartmentRepository departmentRepository,
                            CampaignRepository campaignRepository,
                            RewardRepository rewardRepository,
                            SecurityUtils securityUtils,
                            ComplaintService complaintService) {
        this.complaintRepository = complaintRepository;
        this.fieldWorkerRepository = fieldWorkerRepository;
        this.departmentRepository = departmentRepository;
        this.campaignRepository = campaignRepository;
        this.rewardRepository = rewardRepository;
        this.securityUtils = securityUtils;
        this.complaintService = complaintService;
    }

    public DashboardResponse getCitizenDashboard() {
        UserEntity user = securityUtils.getCurrentUser();
        DashboardResponse resp = new DashboardResponse();

        List<ComplaintEntity> userComplaints = complaintRepository.findByCitizenIdOrderByCreatedAtDesc(user.getId());

        resp.setTotalComplaints(userComplaints.size());
        resp.setResolvedComplaints(userComplaints.stream().filter(c -> c.getStatus() == ComplaintEntity.Status.RESOLVED).count());
        resp.setPendingComplaints(userComplaints.stream()
                .filter(c -> c.getStatus() != ComplaintEntity.Status.RESOLVED && c.getStatus() != ComplaintEntity.Status.REJECTED)
                .count());

        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (ComplaintEntity.Status s : ComplaintEntity.Status.values()) {
            statusCounts.put(s.name(), userComplaints.stream().filter(c -> c.getStatus() == s).count());
        }
        resp.setStatusCounts(statusCounts);

        Map<String, Long> priorityCounts = new LinkedHashMap<>();
        for (ComplaintEntity.Priority p : ComplaintEntity.Priority.values()) {
            priorityCounts.put(p.name(), userComplaints.stream().filter(c -> c.getPriority() == p).count());
        }
        resp.setPriorityCounts(priorityCounts);

        resp.setRecentComplaints(userComplaints.stream().limit(10)
                .map(complaintService::toResponsePublic).collect(Collectors.toList()));

        int totalPoints = rewardRepository.findByCitizenIdOrderByCreatedAtDesc(user.getId())
                .stream().mapToInt(RewardEntity::getPoints).sum();
        resp.setRewardPoints(totalPoints);

        return resp;
    }

    public DashboardResponse getAuthorityDashboard() {
        DashboardResponse resp = new DashboardResponse();

        List<ComplaintEntity> allComplaints = complaintRepository.findAllByOrderByCreatedAtDesc();

        resp.setTotalComplaints(allComplaints.size());
        resp.setResolvedComplaints(allComplaints.stream().filter(c -> c.getStatus() == ComplaintEntity.Status.RESOLVED).count());
        resp.setPendingComplaints(allComplaints.stream()
                .filter(c -> c.getStatus() != ComplaintEntity.Status.RESOLVED && c.getStatus() != ComplaintEntity.Status.REJECTED)
                .count());
        resp.setActiveTasks(complaintRepository.findActiveTasks().size());

        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (ComplaintEntity.Status s : ComplaintEntity.Status.values()) {
            statusCounts.put(s.name(), complaintRepository.countByStatus(s));
        }
        resp.setStatusCounts(statusCounts);

        Map<String, Long> priorityCounts = new LinkedHashMap<>();
        for (ComplaintEntity.Priority p : ComplaintEntity.Priority.values()) {
            priorityCounts.put(p.name(), complaintRepository.countByPriority(p));
        }
        resp.setPriorityCounts(priorityCounts);

        resp.setRecentComplaints(allComplaints.stream().limit(10)
                .map(complaintService::toResponsePublic).collect(Collectors.toList()));

        resp.setWorkers(fieldWorkerRepository.findAll().stream()
                .map(w -> new FieldWorkerResponse(w.getId(), w.getName(), w.getDepartment(),
                        w.getActiveTasks(), w.getCompletedTasks(), w.getAvailability().name(), w.getUserId()))
                .collect(Collectors.toList()));

        resp.setDepartments(departmentRepository.findAll().stream()
                .map(d -> new DepartmentResponse(d.getId(), d.getName(), d.getHead(),
                        d.getTotalComplaints(), d.getResolved(), d.getInProgress(), d.getCreatedAt()))
                .collect(Collectors.toList()));

        return resp;
    }

    public DashboardResponse getWorkforceDashboard() {
        UserEntity user = securityUtils.getCurrentUser();

        // Find the field worker profile linked to this user
        FieldWorkerEntity worker = fieldWorkerRepository.findByUserId(user.getId()).orElse(null);

        DashboardResponse resp = new DashboardResponse();

        List<ComplaintEntity> assignedComplaints;
        if (worker != null) {
            assignedComplaints = complaintRepository.findByAssignedWorkerIdOrderByCreatedAtDesc(worker.getId());
        } else {
            assignedComplaints = complaintRepository.findByAssignedWorkerIdOrderByCreatedAtDesc(user.getId());
        }

        resp.setTotalComplaints(assignedComplaints.size());
        resp.setResolvedComplaints(assignedComplaints.stream().filter(c -> c.getStatus() == ComplaintEntity.Status.RESOLVED).count());
        resp.setActiveTasks(assignedComplaints.stream()
                .filter(c -> c.getStatus() == ComplaintEntity.Status.ASSIGNED || c.getStatus() == ComplaintEntity.Status.IN_PROGRESS)
                .count());

        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (ComplaintEntity.Status s : ComplaintEntity.Status.values()) {
            statusCounts.put(s.name(), assignedComplaints.stream().filter(c -> c.getStatus() == s).count());
        }
        resp.setStatusCounts(statusCounts);

        resp.setRecentComplaints(assignedComplaints.stream().limit(10)
                .map(complaintService::toResponsePublic).collect(Collectors.toList()));

        return resp;
    }

    public DashboardResponse getInfluencerDashboard() {
        UserEntity user = securityUtils.getCurrentUser();
        DashboardResponse resp = new DashboardResponse();

        List<CampaignEntity> campaigns = campaignRepository.findByInfluencerIdOrderByCreatedAtDesc(user.getId());

        resp.setTotalComplaints(campaigns.stream().mapToInt(CampaignEntity::getComplaintsGenerated).sum());
        resp.setActiveTasks(campaigns.size());

        resp.setCampaigns(campaigns.stream()
                .map(c -> new CampaignResponse(c.getId(), c.getTitle(), c.getDescription(), c.getCivicIssue(),
                        c.getArea(), c.getImageUrl(), c.getCallToAction(), c.getReferralCode(),
                        c.getInfluencerId(), c.getInfluencerName(), c.getReach(), c.getClicks(),
                        c.getNewUsers(), c.getComplaintsGenerated(), c.getEngagementRate(), c.getCreatedAt()))
                .collect(Collectors.toList()));

        return resp;
    }
}
