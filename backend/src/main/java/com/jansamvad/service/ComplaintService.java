package com.jansamvad.service;

import com.jansamvad.dto.ComplaintRequest;
import com.jansamvad.dto.ComplaintResponse;
import com.jansamvad.entity.ComplaintEntity;
import com.jansamvad.entity.TimelineEventEntity;
import com.jansamvad.entity.UserEntity;
import com.jansamvad.repository.ComplaintRepository;
import com.jansamvad.repository.UserRepository;
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

    public ComplaintService(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
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
        return toResponse(saved);
    }

    public ComplaintResponse getComplaintById(Long id) {
        ComplaintEntity complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));
        return toResponse(complaint);
    }

    public List<ComplaintResponse> getComplaintsByUser(Long userId) {
        return complaintRepository.findByCitizenIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ComplaintResponse updateStatus(Long id, String status, String taskStatus, String note) {
        ComplaintEntity complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + id));

        complaint.setStatus(ComplaintEntity.Status.valueOf(status.toUpperCase()));
        if (taskStatus != null && !taskStatus.isBlank()) {
            complaint.setTaskStatus(ComplaintEntity.TaskStatus.valueOf(taskStatus.toUpperCase()));
        }

        TimelineEventEntity event = new TimelineEventEntity();
        event.setComplaint(complaint);
        event.setStatus(status);
        event.setActor("System");
        event.setTimestamp(Instant.now());
        if (note != null && !note.isBlank()) {
            event.setNote(note);
        }
        complaint.getTimeline().add(event);

        if ("RESOLVED".equalsIgnoreCase(status)) {
            complaint.setResolvedAt(Instant.now());
        }

        ComplaintEntity saved = complaintRepository.save(complaint);
        return toResponse(saved);
    }

    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
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
