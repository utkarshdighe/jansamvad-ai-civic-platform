package com.jansamvad.controller;

import com.jansamvad.dto.ComplaintResponse;
import com.jansamvad.dto.DepartmentResponse;
import com.jansamvad.service.DepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY') or hasRole('FIELD_WORKFORCE')")
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY') or hasRole('FIELD_WORKFORCE')")
    public ResponseEntity<DepartmentResponse> getDepartment(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartment(id));
    }

    @GetMapping("/{departmentName}/complaints")
    @PreAuthorize("hasRole('MUNICIPAL_AUTHORITY')")
    public ResponseEntity<List<ComplaintResponse>> getComplaintsByDepartment(@PathVariable String departmentName) {
        return ResponseEntity.ok(departmentService.getComplaintsByDepartment(departmentName));
    }
}
