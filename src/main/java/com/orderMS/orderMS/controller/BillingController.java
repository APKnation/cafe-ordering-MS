package com.orderMS.orderMS.controller;

import com.orderMS.orderMS.model.Bill;
import com.orderMS.orderMS.model.enums.PaymentMethod;
import com.orderMS.orderMS.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/generate/{orderId}")
    public ResponseEntity<Bill> generateBill(@PathVariable Long orderId) {
        return ResponseEntity.ok(billingService.generateBill(orderId));
    }

    @PostMapping("/{billId}/pay")
    public ResponseEntity<Bill> payBill(
            @PathVariable Long billId,
            @RequestParam PaymentMethod method) {
        return ResponseEntity.ok(billingService.payBill(billId, method));
    }
}
