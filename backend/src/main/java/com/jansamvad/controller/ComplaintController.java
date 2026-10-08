package com.jansamvad.controller;

import com.jansamvad.dto.*;
import com.jansamvad.entity.UserEntity;
import com.jansamvad.service.ComplaintService;
import com.jansamvad.service.UserService;
import com.jansamvad.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UserService userService;
    private final SecurityUtils securityUtils;

    public ComplaintController(ComplaintService complaintService, UserService userService, SecurityUtils securityUtils) {
        this.complaintService = complaintService;
        this.userService = userService;
        this.securityUtils = securityUtils;
    }

    @PostMapping
    @PreAuthorize("hasRole('CITIZEN') or hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<ComplaintResponse> createComplaint(
            Authentication authentication,
            @Valid @RequestBody ComplaintRequest request) {
        Long userId = getUserIdFromAuth(authentication);
        ComplaintResponse response = complaintService.createComplaint(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY') or hasRole('FIELD_WORKFORCE')")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id) {
        ComplaintResponse complaint = complaintService.getComplaintById(id);
        // Enforce ownership: citizen can only see own, workforce only assigned
        UserEntity currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == UserEntity.Role.CITIZEN) {
            if (!complaint.getCitizenId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else if (currentUser.getRole() == UserEntity.Role.FIELD_WORKFORCE) {
            if (complaint.getAssignedWorkerId() == null || !complaint.getAssignedWorkerId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ComplaintResponse>> getComplaintsByUser(@PathVariable Long userId) {
        UserEntity currentUser = securityUtils.getCurrentUser();
        // Citizens can only view their own complaints; authority can view any
        if (currentUser.getRole() == UserEntity.Role.CITIZEN && !currentUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(complaintService.getComplaintsByUser(userId));
    }

    @GetMapping("/worker/{workerId}")
    @PreAuthorize("hasRole('FIELD_WORKFORCE') or hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<List<ComplaintResponse>> getComplaintsByWorker(@PathVariable Long workerId) {
        UserEntity currentUser = securityUtils.getCurrentUser();
        if (currentUser.getRole() == UserEntity.Role.FIELD_WORKFORCE && !currentUser.getId().equals(workerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(complaintService.getComplaintsByWorker(workerId));
    }

    // ==================== WORKFLOW ENDPOINTS ====================

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<ComplaintResponse> verifyComplaint(
            @PathVariable Long id,
            @Valid @RequestBody VerifyRequest request) {
        return ResponseEntity.ok(complaintService.verifyComplaint(id, request));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<ComplaintResponse> rejectComplaint(
            @PathVariable Long id,
            @Valid @RequestBody RejectRequest request) {
        return ResponseEntity.ok(complaintService.rejectComplaint(id, request));
    }

    @PutMapping("/{id}/priority")
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<ComplaintResponse> changePriority(
            @PathVariable Long id,
            @Valid @RequestBody PriorityRequest request) {
        return ResponseEntity.ok(complaintService.changePriority(id, request));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<ComplaintResponse> assignWorkforce(
            @PathVariable Long id,
            @Valid @RequestBody AssignRequest request) {
        return ResponseEntity.ok(complaintService.assignWorkforce(id, request));
    }

    @PutMapping("/{id}/task-status")
    @PreAuthorize("hasRole('FIELD_WORKFORCE') or hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<ComplaintResponse> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusRequest request) {
        return ResponseEntity.ok(complaintService.updateTaskStatus(id, request));
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('FIELD_WORKFORCE') or hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<ComplaintResponse> resolveComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ResolveRequest request) {
        return ResponseEntity.ok(complaintService.resolveComplaint(id, request));
    }

    // Legacy status update endpoint (kept for backward compatibility)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY') or hasRole('FIELD_WORKFORCE')")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(complaintService.updateStatus(id, request.getStatus(), request.getTaskStatus(), request.getNote()));
    }

    private Long getUserIdFromAuth(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserByEmail(email).getId();
    }
}
