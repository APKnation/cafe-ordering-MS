package com.orderMS.orderMS.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDto {
    private BigDecimal totalRevenue;
    private Long orderCount;
    private BigDecimal taxCollected;
    private BigDecimal discountGiven;
}
