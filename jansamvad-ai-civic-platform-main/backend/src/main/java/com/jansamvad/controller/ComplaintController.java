package com.jansamvad.controller;

import com.jansamvad.dto.ComplaintRequest;
import com.jansamvad.dto.ComplaintResponse;
import com.jansamvad.dto.StatusUpdateRequest;
import com.jansamvad.service.ComplaintService;
import com.jansamvad.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UserService userService;

    public ComplaintController(ComplaintService complaintService, UserService userService) {
        this.complaintService = complaintService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(
            Authentication authentication,
            @Valid @RequestBody ComplaintRequest request) {
        Long userId = getUserIdFromAuth(authentication);
        ComplaintResponse response = complaintService.createComplaint(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ComplaintResponse>> getComplaintsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(complaintService.getComplaintsByUser(userId));
    }

    @PutMapping("/{id}/status")
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
