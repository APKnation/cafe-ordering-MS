package com.orderMS.orderMS.service;

import com.orderMS.orderMS.model.Bill;
import com.orderMS.orderMS.model.OrderItem;
import com.orderMS.orderMS.model.OrderRecord;
import com.orderMS.orderMS.model.enums.OrderType;
import com.orderMS.orderMS.model.enums.PaymentMethod;
import com.orderMS.orderMS.model.enums.PaymentStatus;
import com.orderMS.orderMS.repository.BillRepository;
import com.orderMS.orderMS.repository.DiningTableRepository;
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
    private final DiningTableRepository diningTableRepository;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.10"); // 10% tax

    @Transactional
    public Bill generateBill(Long orderId, BigDecimal discount, Boolean isPercentage) {
        OrderRecord order = orderRecordRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getBill() != null) {
            return order.getBill();
        }

        BigDecimal totalAmount = order.getTotalAmount();
        BigDecimal taxAmount = totalAmount.multiply(TAX_RATE);
        BigDecimal discountAmount = BigDecimal.ZERO;

        if (discount != null && discount.compareTo(BigDecimal.ZERO) > 0) {
            if (isPercentage != null && isPercentage) {
                discountAmount = totalAmount.multiply(discount).divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
            } else {
                discountAmount = discount;
            }
        }

        BigDecimal finalAmount = totalAmount.add(taxAmount).subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        Bill bill = Bill.builder()
                .order(order)
                .totalAmount(totalAmount)
                .taxAmount(taxAmount)
                .discountAmount(discountAmount)
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

        OrderRecord order = bill.getOrder();
        if (order != null && order.getOrderType() == OrderType.DINE_IN && order.getTableNumber() != null) {
            diningTableRepository.findByTableNumber(order.getTableNumber()).ifPresent(table -> {
                table.setIsOccupied(false);
                diningTableRepository.save(table);
            });
        }

        return billRepository.save(bill);
    }

    public String getReceiptText(Long billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        if (bill.getStatus() != PaymentStatus.PAID) {
            throw new RuntimeException("Receipt can only be generated for paid bills");
        }

        OrderRecord order = bill.getOrder();
        StringBuilder receipt = new StringBuilder();
        receipt.append("========================================\n");
        receipt.append("            CAFE RECEIPT                \n");
        receipt.append("========================================\n");
        receipt.append("Bill ID: ").append(bill.getId()).append("\n");
        receipt.append("Order ID: ").append(order.getId()).append("\n");
        receipt.append("Type: ").append(order.getOrderType()).append("\n");
        if (order.getTableNumber() != null) {
            receipt.append("Table: ").append(order.getTableNumber()).append("\n");
        }
        receipt.append("Date: ").append(bill.getIssuedAt()).append("\n");
        receipt.append("----------------------------------------\n");
        receipt.append(String.format("%-20s %-5s %-10s\n", "Item", "Qty", "Price"));
        receipt.append("----------------------------------------\n");
        for (OrderItem item : order.getItems()) {
            receipt.append(String.format("%-20s %-5d $%-9.2f\n",
                    item.getMenuItem().getName(),
                    item.getQuantity(),
                    item.getPrice().doubleValue() * item.getQuantity()));
        }
        receipt.append("----------------------------------------\n");
        receipt.append(String.format("%-26s $%-10.2f\n", "Subtotal:", bill.getTotalAmount()));
        receipt.append(String.format("%-26s $%-10.2f\n", "Tax (10%):", bill.getTaxAmount()));
        if (bill.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            receipt.append(String.format("%-26s -$%-9.2f\n", "Discount:", bill.getDiscountAmount()));
        }
        receipt.append("----------------------------------------\n");
        receipt.append(String.format("%-26s $%-10.2f\n", "Total Paid:", bill.getFinalAmount()));
        receipt.append("Payment Method: ").append(bill.getPaymentMethod()).append("\n");
        receipt.append("========================================\n");
        receipt.append("          THANK YOU FOR VISITING!       \n");
        receipt.append("========================================\n");

        return receipt.toString();
    }
}
