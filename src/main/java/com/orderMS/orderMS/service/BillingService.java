package com.orderMS.orderMS.service;

import com.orderMS.orderMS.model.Bill;
import com.orderMS.orderMS.model.OrderRecord;
import com.orderMS.orderMS.model.enums.PaymentMethod;
import com.orderMS.orderMS.model.enums.PaymentStatus;
import com.orderMS.orderMS.repository.BillRepository;
import com.orderMS.orderMS.repository.OrderRecordRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillRepository billRepository;
    private final OrderRecordRepository orderRecordRepository;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.10"); // 10% tax

    @Transactional
    public Bill generateBill(Long orderId) {
        OrderRecord order = orderRecordRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getBill() != null) {
            return order.getBill();
        }

        BigDecimal totalAmount = order.getTotalAmount();
        BigDecimal taxAmount = totalAmount.multiply(TAX_RATE);
        BigDecimal finalAmount = totalAmount.add(taxAmount);

        Bill bill = Bill.builder()
                .order(order)
                .totalAmount(totalAmount)
                .taxAmount(taxAmount)
                .finalAmount(finalAmount)
                .status(PaymentStatus.PENDING)
                .issuedAt(LocalDateTime.now())
                .build();

        return billRepository.save(bill);
    }

    @Transactional
    public Bill payBill(Long billId, PaymentMethod method) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        if (bill.getStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Bill is already paid");
        }

        bill.setStatus(PaymentStatus.PAID);
        bill.setPaymentMethod(method);

        return billRepository.save(bill);
    }
}
