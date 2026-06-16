package com.orderMS.orderMS.repository;

import com.orderMS.orderMS.model.Bill;
import com.orderMS.orderMS.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByOrderId(Long orderId);
    List<Bill> findByStatus(PaymentStatus status);
}
