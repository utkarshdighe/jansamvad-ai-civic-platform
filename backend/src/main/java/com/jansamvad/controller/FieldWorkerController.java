package com.jansamvad.controller;

import com.jansamvad.dto.ComplaintResponse;
import com.jansamvad.dto.FieldWorkerResponse;
import com.jansamvad.service.FieldWorkerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workforce")
public class FieldWorkerController {

    private final FieldWorkerService fieldWorkerService;

    public FieldWorkerController(FieldWorkerService fieldWorkerService) {
        this.fieldWorkerService = fieldWorkerService;
    }

    @GetMapping
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY') or hasRole('FIELD_WORKFORCE')")
    public ResponseEntity<List<FieldWorkerResponse>> getAllWorkers() {
        return ResponseEntity.ok(fieldWorkerService.getAllWorkers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY') or hasRole('FIELD_WORKFORCE')")
    public ResponseEntity<FieldWorkerResponse> getWorker(@PathVariable Long id) {
        return ResponseEntity.ok(fieldWorkerService.getWorker(id));
    }

    @GetMapping("/{workerId}/complaints")
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY') or hasRole('FIELD_WORKFORCE')")
    public ResponseEntity<List<ComplaintResponse>> getAssignedComplaints(@PathVariable Long workerId) {
        return ResponseEntity.ok(fieldWorkerService.getAssignedComplaints(workerId));
    }

    @PutMapping("/complaints/{complaintId}/complete")
    @PreAuthorize("hasRole('FIELD_WORKFORCE') or hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<ComplaintResponse> markTaskCompleted(@PathVariable Long complaintId) {
        return ResponseEntity.ok(fieldWorkerService.markTaskCompleted(complaintId));
    }
}
