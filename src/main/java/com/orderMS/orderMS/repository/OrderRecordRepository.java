package com.orderMS.orderMS.repository;

import com.orderMS.orderMS.model.OrderRecord;
import com.orderMS.orderMS.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRecordRepository extends JpaRepository<OrderRecord, Long> {
    List<OrderRecord> findByStatus(OrderStatus status);
    List<OrderRecord> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<OrderRecord> findByCompletedAtBetween(LocalDateTime start, LocalDateTime end);
}
