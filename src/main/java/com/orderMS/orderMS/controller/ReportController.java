package com.orderMS.orderMS.controller;

import com.orderMS.orderMS.dto.BestSellerDto;
import com.orderMS.orderMS.dto.ReportDto;
import com.orderMS.orderMS.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/sales")
    public ResponseEntity<ReportDto> getSalesReport(@RequestParam String period) {
        return ResponseEntity.ok(reportService.getSalesReport(period));
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<List<BestSellerDto>> getBestSellers() {
        return ResponseEntity.ok(reportService.getBestSellers());
    }

    @GetMapping("/revenue")
    public ResponseEntity<ReportDto> getRevenueAnalysis() {
        return ResponseEntity.ok(reportService.getRevenueAnalysis());
    }
}
