package com.orderMS.orderMS.service;

import com.orderMS.orderMS.model.OrderRecord;
import com.orderMS.orderMS.model.enums.OrderType;
import com.orderMS.orderMS.repository.OrderRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRecordRepository orderRecordRepository;

    public Map<Integer, Long> getPeakTimes() {
        List<OrderRecord> allOrders = orderRecordRepository.findAll();

        return allOrders.stream()
                .filter(o -> o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().getHour(),
                        Collectors.counting()
                ));
    }

    public Double getAverageTableTurnoverMinutes() {
        List<OrderRecord> allOrders = orderRecordRepository.findAll();

        List<OrderRecord> completedDineInOrders = allOrders.stream()
                .filter(o -> o.getOrderType() == OrderType.DINE_IN && o.getCompletedAt() != null)
                .toList();

        if (completedDineInOrders.isEmpty()) return 0.0;

        long totalMinutes = completedDineInOrders.stream()
                .mapToLong(o -> Duration.between(o.getCreatedAt(), o.getCompletedAt()).toMinutes())
                .sum();

        return (double) totalMinutes / completedDineInOrders.size();
    }
}
