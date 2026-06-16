package com.orderMS.orderMS.service;

import com.orderMS.orderMS.dto.BestSellerDto;
import com.orderMS.orderMS.dto.ReportDto;
import com.orderMS.orderMS.model.Bill;
import com.orderMS.orderMS.model.OrderItem;
import com.orderMS.orderMS.model.OrderRecord;
import com.orderMS.orderMS.model.enums.PaymentStatus;
import com.orderMS.orderMS.repository.BillRepository;
import com.orderMS.orderMS.repository.OrderRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final BillRepository billRepository;
    private final OrderRecordRepository orderRecordRepository;

    public ReportDto getSalesReport(String period) {
        LocalDateTime cutoff = LocalDateTime.now();
        if ("daily".equalsIgnoreCase(period)) {
            cutoff = cutoff.minusDays(1);
        } else if ("weekly".equalsIgnoreCase(period)) {
            cutoff = cutoff.minusWeeks(1);
        } else if ("monthly".equalsIgnoreCase(period)) {
            cutoff = cutoff.minusMonths(1);
        } else {
            throw new IllegalArgumentException("Invalid period. Use daily, weekly, or monthly.");
        }

        final LocalDateTime finalCutoff = cutoff;
        List<Bill> bills = billRepository.findAll().stream()
                .filter(b -> b.getStatus() == PaymentStatus.PAID && b.getIssuedAt().isAfter(finalCutoff))
                .toList();

        BigDecimal totalRevenue = bills.stream()
                .map(Bill::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTax = bills.stream()
                .map(Bill::getTaxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDiscount = bills.stream()
                .map(Bill::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ReportDto.builder()
                .totalRevenue(totalRevenue)
                .orderCount((long) bills.size())
                .taxCollected(totalTax)
                .discountGiven(totalDiscount)
                .build();
    }

    public List<BestSellerDto> getBestSellers() {
        List<OrderRecord> orders = orderRecordRepository.findAll();

        Map<String, Long> itemQuantities = new HashMap<>();

        for (OrderRecord order : orders) {
            // Only count orders that are served/completed and paid
            if (order.getBill() != null && order.getBill().getStatus() == PaymentStatus.PAID) {
                for (OrderItem item : order.getItems()) {
                    String name = item.getMenuItem().getName();
                    long qty = item.getQuantity();
                    itemQuantities.put(name, itemQuantities.getOrDefault(name, 0L) + qty);
                }
            }
        }

        return itemQuantities.entrySet().stream()
                .map(entry -> BestSellerDto.builder()
                        .itemName(entry.getKey())
                        .quantitySold(entry.getValue())
                        .build())
                .sorted((a, b) -> b.getQuantitySold().compareTo(a.getQuantitySold()))
                .collect(Collectors.toList());
    }

    public ReportDto getRevenueAnalysis() {
        List<Bill> bills = billRepository.findByStatus(PaymentStatus.PAID);

        BigDecimal totalRevenue = bills.stream()
                .map(Bill::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTax = bills.stream()
                .map(Bill::getTaxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDiscount = bills.stream()
                .map(Bill::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ReportDto.builder()
                .totalRevenue(totalRevenue)
                .orderCount((long) bills.size())
                .taxCollected(totalTax)
                .discountGiven(totalDiscount)
                .build();
    }
}
