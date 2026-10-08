package com.jansamvad.repository;

import com.jansamvad.entity.FieldWorkerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FieldWorkerRepository extends JpaRepository<FieldWorkerEntity, Long> {
    List<FieldWorkerEntity> findByDepartment(String department);
    List<FieldWorkerEntity> findByAvailability(FieldWorkerEntity.Availability availability);
    Optional<FieldWorkerEntity> findByUserId(Long userId);
}
