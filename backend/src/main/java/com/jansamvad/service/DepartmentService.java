package com.jansamvad.service;

import com.jansamvad.dto.ComplaintResponse;
import com.jansamvad.dto.DepartmentResponse;
import com.jansamvad.entity.ComplaintEntity;
import com.jansamvad.entity.DepartmentEntity;
import com.jansamvad.repository.ComplaintRepository;
import com.jansamvad.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintService complaintService;

    public DepartmentService(DepartmentRepository departmentRepository,
                             ComplaintRepository complaintRepository,
                             ComplaintService complaintService) {
        this.departmentRepository = departmentRepository;
        this.complaintRepository = complaintRepository;
        this.complaintService = complaintService;
    }

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DepartmentResponse getDepartment(Long id) {
        DepartmentEntity dept = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found with id: " + id));
        return toResponse(dept);
    }

    public List<ComplaintResponse> getComplaintsByDepartment(String departmentName) {
        DepartmentEntity dept = departmentRepository.findByName(departmentName)
                .orElseThrow(() -> new IllegalArgumentException("Department not found: " + departmentName));
        List<ComplaintEntity> complaints = complaintRepository.findByDepartmentOrderByCreatedAtDesc(dept.getName());
        return complaints.stream()
                .map(complaintService::toResponsePublic)
                .collect(Collectors.toList());
    }

    private DepartmentResponse toResponse(DepartmentEntity d) {
        return new DepartmentResponse(
                d.getId(), d.getName(), d.getHead(), d.getTotalComplaints(),
                d.getResolved(), d.getInProgress(), d.getCreatedAt()
        );
    }
}
