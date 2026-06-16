package com.orderMS.orderMS.controller;

import com.orderMS.orderMS.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/peak-times")
    public ResponseEntity<Map<Integer, Long>> getPeakTimes() {
        return ResponseEntity.ok(analyticsService.getPeakTimes());
    }

    @GetMapping("/table-turnover")
    public ResponseEntity<Double> getAverageTableTurnoverMinutes() {
        return ResponseEntity.ok(analyticsService.getAverageTableTurnoverMinutes());
    }
}
