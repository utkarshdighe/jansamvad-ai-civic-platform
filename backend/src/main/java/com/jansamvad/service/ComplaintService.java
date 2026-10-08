package com.jansamvad.service;

import com.jansamvad.dto.*;
import com.jansamvad.entity.*;
import com.jansamvad.repository.*;
import com.jansamvad.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final FieldWorkerRepository fieldWorkerRepository;
    private final NotificationService notificationService;
    private final RewardService rewardService;
    private final SecurityUtils securityUtils;

    public ComplaintService(ComplaintRepository complaintRepository,
                            UserRepository userRepository,
                            FieldWorkerRepository fieldWorkerRepository,
                            NotificationService notificationService,
                            RewardService rewardService,
                            SecurityUtils securityUtils) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.fieldWorkerRepository = fieldWorkerRepository;
        this.notificationService = notificationService;
        this.rewardService = rewardService;
        this.securityUtils = securityUtils;
    }

    public ComplaintResponse createComplaint(ComplaintRequest request, Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        ComplaintEntity complaint = new ComplaintEntity();
        complaint.setComplaintNumber(generateComplaintNumber());
        complaint.setCitizenId(user.getId());
        complaint.setCitizen(user);
        complaint.setCitizenName(user.getFullName());
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCategory(request.getCategory());
        complaint.setLocation(request.getLocation());
        complaint.setLatitude(request.getLatitude());
        complaint.setLongitude(request.getLongitude());
        complaint.setImageUrl(request.getImageUrl());
        complaint.setVideoName(request.getVideoName());
        complaint.setPriority(parsePriority(request.getPriority(), ComplaintEntity.Priority.MEDIUM));
        complaint.setDepartment(request.getDepartment() != null ? request.getDepartment() : "");
        complaint.setStatus(ComplaintEntity.Status.REGISTERED);
        complaint.setRewardPoints(50);

        if (request.getAiCategory() != null) complaint.setAiCategory(request.getAiCategory());
        if (request.getAiDepartment() != null) complaint.setAiDepartment(request.getAiDepartment());
        if (request.getAiPriority() != null) complaint.setAiPriority(parsePriority(request.getAiPriority(), null));
        if (request.getAiConfidence() != null) complaint.setAiConfidence(request.getAiConfidence());
        if (request.getAiSeverity() != null) complaint.setAiSeverity(request.getAiSeverity());
        if (request.getAiSummary() != null) complaint.setAiSummary(request.getAiSummary());
        if (request.getAiSuggestedAction() != null) complaint.setAiSuggestedAction(request.getAiSuggestedAction());

        ComplaintEntity saved = complaintRepository.save(complaint);

        addTimelineEvent(saved, "REGISTERED", user.getFullName() + " (" + user.getRole().name() + ")",
                "Complaint submitted by citizen");

        // Reward for submission
        rewardService.addReward(user.getId(), 50, "Complaint submitted: " + complaint.getComplaintNumber(), saved.getId());

        // Notify citizen
        notificationService.createNotification(user.getId(), UserEntity.Role.CITIZEN,
                "Complaint Registered", "Your complaint " + complaint.getComplaintNumber() + " has been registered.",
                NotificationEntity.NotificationType.SUCCESS);

        return toResponse(saved);
    }

    public ComplaintResponse verifyComplaint(Long id, VerifyRequest request) {
        UserEntity actor = securityUtils.getCurrentUser();
        ComplaintEntity complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        complaint.setCategory(request.getCategory());
        complaint.setDepartment(request.getDepartment());
        complaint.setPriority(parsePriority(request.getPriority(), complaint.getPriority()));
        complaint.setStatus(ComplaintEntity.Status.VERIFIED);

        addTimelineEvent(complaint, "VERIFIED", actor.getFullName() + " (MUNICIPAL_AUTHORITY)",
                "Complaint verified, category/department/priority updated");

        // Reward for verification (to citizen)
        rewardService.addReward(complaint.getCitizenId(), 10, "Complaint verified: " + complaint.getComplaintNumber(), complaint.getId());

        // Notify citizen
        notificationService.createNotification(complaint.getCitizenId(), UserEntity.Role.CITIZEN,
                "Complaint Verified", "Your complaint " + complaint.getComplaintNumber() + " has been verified and forwarded.",
                NotificationEntity.NotificationType.SUCCESS);

        return toResponse(complaintRepository.save(complaint));
    }

    public ComplaintResponse rejectComplaint(Long id, RejectRequest request) {
        UserEntity actor = securityUtils.getCurrentUser();
        ComplaintEntity complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        complaint.setStatus(ComplaintEntity.Status.REJECTED);

        addTimelineEvent(complaint, "REJECTED", actor.getFullName() + " (MUNICIPAL_AUTHORITY)",
                request.getReason());

        // Notify citizen
        notificationService.createNotification(complaint.getCitizenId(), UserEntity.Role.CITIZEN,
                "Complaint Rejected", "Your complaint " + complaint.getComplaintNumber() + " was rejected: " + request.getReason(),
                NotificationEntity.NotificationType.WARNING);

        return toResponse(complaintRepository.save(complaint));
    }

    public ComplaintResponse changePriority(Long id, PriorityRequest request) {
        UserEntity actor = securityUtils.getCurrentUser();
        ComplaintEntity complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        ComplaintEntity.Priority newPriority = parsePriority(request.getPriority(), complaint.getPriority());
        ComplaintEntity.Priority oldPriority = complaint.getPriority();
        complaint.setPriority(newPriority);

        addTimelineEvent(complaint, "PRIORITY_CHANGED", actor.getFullName() + " (MUNICIPAL_AUTHORITY)",
                "Priority changed from " + oldPriority + " to " + newPriority);

        // Notify citizen
        notificationService.createNotification(complaint.getCitizenId(), UserEntity.Role.CITIZEN,
                "Priority Updated", "Your complaint " + complaint.getComplaintNumber() + " priority changed to " + newPriority,
                NotificationEntity.NotificationType.INFO);

        return toResponse(complaintRepository.save(complaint));
    }

    public ComplaintResponse assignWorkforce(Long id, AssignRequest request) {
        UserEntity actor = securityUtils.getCurrentUser();
        ComplaintEntity complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        FieldWorkerEntity worker = fieldWorkerRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new IllegalArgumentException("Field worker not found with id: " + request.getWorkerId()));

        complaint.setAssignedWorkerId(worker.getId());
        complaint.setAssignedWorkerName(worker.getName());
        complaint.setStatus(ComplaintEntity.Status.ASSIGNED);
        complaint.setTaskStatus(ComplaintEntity.TaskStatus.ASSIGNED);

        addTimelineEvent(complaint, "ASSIGNED", actor.getFullName() + " (MUNICIPAL_AUTHORITY)",
                "Assigned to " + worker.getName() + " (" + worker.getDepartment() + ")");

        // Notify workforce user
        if (worker.getUserId() != null) {
            notificationService.createNotification(worker.getUserId(), UserEntity.Role.FIELD_WORKFORCE,
                    "New Task Assigned", "Complaint " + complaint.getComplaintNumber() + " has been assigned to you.",
                    NotificationEntity.NotificationType.INFO);
        }

        // Notify citizen
        notificationService.createNotification(complaint.getCitizenId(), UserEntity.Role.CITIZEN,
                "Workforce Assigned", "Your complaint " + complaint.getComplaintNumber() + " has been assigned to " + worker.getName() + ".",
                NotificationEntity.NotificationType.INFO);

        return toResponse(complaintRepository.save(complaint));
    }

    public ComplaintResponse updateTaskStatus(Long id, TaskStatusRequest request) {
        UserEntity actor = securityUtils.getCurrentUser();
        ComplaintEntity complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        // Only assigned workforce or authority can update task status
        boolean isAssignedWorker = complaint.getAssignedWorkerId() != null
                && actor.getId().equals(complaint.getAssignedWorkerId());
        boolean isAuthority = actor.getRole() == UserEntity.Role.MUNICIPAL_AUTHORITY;
        if (!isAssignedWorker && !isAuthority) {
            throw new IllegalArgumentException("You are not authorized to update this task");
        }

        ComplaintEntity.TaskStatus newTaskStatus = ComplaintEntity.TaskStatus.valueOf(request.getTaskStatus().toUpperCase());
        complaint.setTaskStatus(newTaskStatus);

        String statusLabel;
        if (newTaskStatus == ComplaintEntity.TaskStatus.IN_PROGRESS) {
            complaint.setStatus(ComplaintEntity.Status.IN_PROGRESS);
            statusLabel = "Task started";
        } else if (newTaskStatus == ComplaintEntity.TaskStatus.WORK_COMPLETED) {
            statusLabel = "Work completed";
        } else if (newTaskStatus == ComplaintEntity.TaskStatus.ACCEPTED) {
            statusLabel = "Task accepted";
        } else {
            statusLabel = "Task status: " + newTaskStatus;
        }

        addTimelineEvent(complaint, newTaskStatus.name(), actor.getFullName() + " (" + actor.getRole().name() + ")", statusLabel);

        // Notify citizen of progress
        notificationService.createNotification(complaint.getCitizenId(), UserEntity.Role.CITIZEN,
                "Complaint Update", "Your complaint " + complaint.getComplaintNumber() + ": " + statusLabel,
                NotificationEntity.NotificationType.INFO);

        return toResponse(complaintRepository.save(complaint));
    }

    public ComplaintResponse resolveComplaint(Long id, ResolveRequest request) {
        UserEntity actor = securityUtils.getCurrentUser();
        ComplaintEntity complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        // Only assigned workforce or authority can resolve
        boolean isAssignedWorker = complaint.getAssignedWorkerId() != null
                && actor.getId().equals(complaint.getAssignedWorkerId());
        boolean isAuthority = actor.getRole() == UserEntity.Role.MUNICIPAL_AUTHORITY;
        if (!isAssignedWorker && !isAuthority) {
            throw new IllegalArgumentException("You are not authorized to resolve this complaint");
        }

        complaint.setStatus(ComplaintEntity.Status.RESOLVED);
        complaint.setTaskStatus(ComplaintEntity.TaskStatus.RESOLVED);
        complaint.setResolutionNote(request.getResolutionNote());
        complaint.setResolvedAt(Instant.now());
        if (request.getAfterPhotoUrl() != null) {
            complaint.setAfterPhotoUrl(request.getAfterPhotoUrl());
        }

        addTimelineEvent(complaint, "RESOLVED", actor.getFullName() + " (" + actor.getRole().name() + ")",
                request.getResolutionNote());

        // Reward for resolution (to citizen)
        rewardService.addReward(complaint.getCitizenId(), 20, "Complaint resolved: " + complaint.getComplaintNumber(), complaint.getId());

        // Notify citizen
        notificationService.createNotification(complaint.getCitizenId(), UserEntity.Role.CITIZEN,
                "Complaint Resolved", "Your complaint " + complaint.getComplaintNumber() + " has been resolved.",
                NotificationEntity.NotificationType.SUCCESS);

        // Notify authority
        notificationService.createNotification(0L, UserEntity.Role.MUNICIPAL_AUTHORITY,
                "Complaint Resolved", "Complaint " + complaint.getComplaintNumber() + " resolved by " + actor.getFullName() + ".",
                NotificationEntity.NotificationType.SUCCESS);

        return toResponse(complaintRepository.save(complaint));
    }

    public ComplaintResponse getComplaintById(Long id) {
        return complaintRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));
    }

    public List<ComplaintResponse> getComplaintsByUser(Long userId) {
        return complaintRepository.findByCitizenIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getComplaintsByWorker(Long workerId) {
        return complaintRepository.findByAssignedWorkerIdOrderByCreatedAtDesc(workerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Legacy status update for backward compatibility
    public ComplaintResponse updateStatus(Long id, String status, String taskStatus, String note) {
        UserEntity actor = securityUtils.getCurrentUser();
        ComplaintEntity complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        complaint.setStatus(ComplaintEntity.Status.valueOf(status.toUpperCase()));
        if (taskStatus != null && !taskStatus.isBlank()) {
            complaint.setTaskStatus(ComplaintEntity.TaskStatus.valueOf(taskStatus.toUpperCase()));
        }

        addTimelineEvent(complaint, status, actor.getFullName() + " (" + actor.getRole().name() + ")", note);

        if ("RESOLVED".equalsIgnoreCase(status)) {
            complaint.setResolvedAt(Instant.now());
        }

        return toResponse(complaintRepository.save(complaint));
    }

    void addTimelineEvent(ComplaintEntity complaint, String status, String actor, String note) {
        TimelineEventEntity event = new TimelineEventEntity();
        event.setComplaint(complaint);
        event.setStatus(status);
        event.setActor(actor);
        event.setTimestamp(Instant.now());
        if (note != null && !note.isBlank()) {
            event.setNote(note);
        }
        complaint.getTimeline().add(event);
    }

    private ComplaintResponse toResponse(ComplaintEntity c) {
        ComplaintResponse resp = new ComplaintResponse();
        resp.setId(c.getId());
        resp.setComplaintNumber(c.getComplaintNumber());
        resp.setCitizenId(c.getCitizenId());
        resp.setCitizenName(c.getCitizenName());
        resp.setTitle(c.getTitle());
        resp.setDescription(c.getDescription());
        resp.setCategory(c.getCategory());
        resp.setLocation(c.getLocation());
        resp.setLatitude(c.getLatitude());
        resp.setLongitude(c.getLongitude());
        resp.setPriority(c.getPriority() != null ? c.getPriority().name() : null);
        resp.setDepartment(c.getDepartment());
        resp.setAiCategory(c.getAiCategory());
        resp.setAiDepartment(c.getAiDepartment());
        resp.setAiPriority(c.getAiPriority() != null ? c.getAiPriority().name() : null);
        resp.setAiConfidence(c.getAiConfidence());
        resp.setAiSeverity(c.getAiSeverity());
        resp.setAiSuggestedAction(c.getAiSuggestedAction());
        resp.setAiSummary(c.getAiSummary());
        resp.setStatus(c.getStatus() != null ? c.getStatus().name() : null);
        resp.setTaskStatus(c.getTaskStatus() != null ? c.getTaskStatus().name() : null);
        resp.setAssignedWorkerId(c.getAssignedWorkerId());
        resp.setAssignedWorkerName(c.getAssignedWorkerName());
        resp.setImageUrl(c.getImageUrl());
        resp.setVideoName(c.getVideoName());
        resp.setBeforePhotoUrl(c.getBeforePhotoUrl());
        resp.setAfterPhotoUrl(c.getAfterPhotoUrl());
        resp.setResolutionNote(c.getResolutionNote());
        resp.setRewardPoints(c.getRewardPoints());
        resp.setCreatedAt(c.getCreatedAt());
        resp.setUpdatedAt(c.getUpdatedAt());
        resp.setResolvedAt(c.getResolvedAt());
        resp.setTimeline(c.getTimeline().stream().map(t -> new ComplaintResponse.TimelineEventDto(
                t.getStatus(), t.getTimestamp(), t.getActor(), t.getNote()
        )).collect(Collectors.toList()));
        return resp;
    }

    private String generateComplaintNumber() {
        return "JS-2026-" + String.format("%06d", System.currentTimeMillis() % 1000000);
    }

    private ComplaintEntity.Priority parsePriority(String value, ComplaintEntity.Priority defaultValue) {
        if (value == null || value.isBlank()) return defaultValue;
        try {
            return ComplaintEntity.Priority.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return defaultValue;
        }
    }
}
