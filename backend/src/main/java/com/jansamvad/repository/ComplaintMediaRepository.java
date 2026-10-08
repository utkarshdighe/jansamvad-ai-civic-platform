package com.jansamvad.repository;

import com.jansamvad.entity.ComplaintMediaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintMediaRepository extends JpaRepository<ComplaintMediaEntity, Long> {
    List<ComplaintMediaEntity> findByComplaintId(Long complaintId);
}
