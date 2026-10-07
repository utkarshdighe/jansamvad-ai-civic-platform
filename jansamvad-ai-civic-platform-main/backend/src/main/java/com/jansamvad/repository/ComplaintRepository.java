package com.jansamvad.repository;

import com.jansamvad.entity.ComplaintEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<ComplaintEntity, Long> {
    List<ComplaintEntity> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);
    List<ComplaintEntity> findAllByOrderByCreatedAtDesc();
    List<ComplaintEntity> findByAssignedWorkerIdOrderByCreatedAtDesc(Long workerId);
    List<ComplaintEntity> findByStatus(ComplaintEntity.Status status);

    @Query("SELECT c FROM ComplaintEntity c WHERE c.status = com.jansamvad.entity.ComplaintEntity.Status.ASSIGNED OR c.status = com.jansamvad.entity.ComplaintEntity.Status.IN_PROGRESS")
    List<ComplaintEntity> findActiveTasks();

    long countByStatus(ComplaintEntity.Status status);
}
