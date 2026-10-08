package com.jansamvad.service;

import com.jansamvad.dto.ComplaintResponse;
import com.jansamvad.dto.FieldWorkerResponse;
import com.jansamvad.entity.ComplaintEntity;
import com.jansamvad.entity.FieldWorkerEntity;
import com.jansamvad.entity.UserEntity;
import com.jansamvad.repository.ComplaintRepository;
import com.jansamvad.repository.FieldWorkerRepository;
import com.jansamvad.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FieldWorkerService {

    private final FieldWorkerRepository fieldWorkerRepository;
    private final ComplaintRepository complaintRepository;
    private final SecurityUtils securityUtils;
    private final ComplaintService complaintService;

    public FieldWorkerService(FieldWorkerRepository fieldWorkerRepository,
                              ComplaintRepository complaintRepository,
                              SecurityUtils securityUtils,
                              ComplaintService complaintService) {
        this.fieldWorkerRepository = fieldWorkerRepository;
        this.complaintRepository = complaintRepository;
        this.securityUtils = securityUtils;
        this.complaintService = complaintService;
    }

    public List<FieldWorkerResponse> getAllWorkers() {
        return fieldWorkerRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public FieldWorkerResponse getWorker(Long id) {
        FieldWorkerEntity worker = fieldWorkerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Field worker not found with id: " + id));
        return toResponse(worker);
    }

    public List<ComplaintResponse> getAssignedComplaints(Long workerId) {
        UserEntity currentUser = securityUtils.getCurrentUser();
        // Workforce can only see their own assigned complaints; authority can see any
        if (currentUser.getRole() == UserEntity.Role.FIELD_WORKFORCE && !currentUser.getId().equals(workerId)) {
            throw new IllegalArgumentException("You can only view your own assigned complaints");
        }
        return complaintRepository.findByAssignedWorkerIdOrderByCreatedAtDesc(workerId).stream()
                .map(complaintService::toResponsePublic)
                .collect(Collectors.toList());
    }

    public ComplaintResponse updateTaskStatus(Long complaintId, String taskStatus) {
        return complaintService.updateTaskStatus(complaintId, new com.jansamvad.dto.TaskStatusRequest());
    }

    public ComplaintResponse markTaskCompleted(Long complaintId) {
        UserEntity currentUser = securityUtils.getCurrentUser();
        ComplaintEntity complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found with id: " + complaintId));

        boolean isAssignedWorker = complaint.getAssignedWorkerId() != null
                && currentUser.getId().equals(complaint.getAssignedWorkerId());
        boolean isAuthority = currentUser.getRole() == UserEntity.Role.MUNICIPAL_AUTHORITY;
        if (!isAssignedWorker && !isAuthority) {
            throw new IllegalArgumentException("You are not authorized to update this task");
        }

        complaint.setTaskStatus(ComplaintEntity.TaskStatus.WORK_COMPLETED);
        if (complaint.getStatus() != ComplaintEntity.Status.RESOLVED) {
            complaint.setStatus(ComplaintEntity.Status.IN_PROGRESS);
        }

        complaintService.addTimelineEventPublic(complaint, "WORK_COMPLETED",
                currentUser.getFullName() + " (" + currentUser.getRole().name() + ")",
                "Work marked as completed");

        return complaintService.toResponsePublic(complaintRepository.save(complaint));
    }

    private FieldWorkerResponse toResponse(FieldWorkerEntity w) {
        return new FieldWorkerResponse(
                w.getId(), w.getName(), w.getDepartment(), w.getActiveTasks(),
                w.getCompletedTasks(), w.getAvailability().name(), w.getUserId()
        );
    }
}
