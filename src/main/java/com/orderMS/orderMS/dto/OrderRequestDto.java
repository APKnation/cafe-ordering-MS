package com.orderMS.orderMS.dto;

import com.orderMS.orderMS.model.enums.OrderType;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequestDto {
    private OrderType orderType;
    private Integer tableNumber;
    private List<OrderItemRequestDto> items;
}
