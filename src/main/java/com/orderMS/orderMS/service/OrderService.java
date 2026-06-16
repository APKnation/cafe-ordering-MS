package com.orderMS.orderMS.service;

import com.orderMS.orderMS.dto.OrderItemRequestDto;
import com.orderMS.orderMS.dto.OrderRequestDto;
import com.orderMS.orderMS.model.MenuItem;
import com.orderMS.orderMS.model.OrderItem;
import com.orderMS.orderMS.model.OrderRecord;
import com.orderMS.orderMS.model.DiningTable;
import com.orderMS.orderMS.model.enums.OrderStatus;
import com.orderMS.orderMS.model.enums.OrderType;
import com.orderMS.orderMS.repository.DiningTableRepository;
import com.orderMS.orderMS.repository.MenuItemRepository;
import com.orderMS.orderMS.repository.OrderRecordRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRecordRepository orderRecordRepository;
    private final MenuItemRepository menuItemRepository;
    private final DiningTableRepository diningTableRepository;

    @Transactional
    public OrderRecord placeOrder(OrderRequestDto request) {
        if (request.getOrderType() == OrderType.DINE_IN) {
            if (request.getTableNumber() == null) {
                throw new RuntimeException("Table number is required for Dine-in orders");
            }
            DiningTable table = diningTableRepository.findByTableNumber(request.getTableNumber())
                    .orElseThrow(() -> new RuntimeException("Table " + request.getTableNumber() + " does not exist"));
            if (table.getIsOccupied()) {
                throw new RuntimeException("Table " + request.getTableNumber() + " is already occupied");
            }
            table.setIsOccupied(true);
            diningTableRepository.save(table);
        }

        OrderRecord order = OrderRecord.builder()
                .orderType(request.getOrderType())
                .tableNumber(request.getTableNumber())
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequestDto itemDto : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemDto.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("MenuItem not found"));

            if (menuItem.getAvailableQuantity() < itemDto.getQuantity() || !menuItem.getIsAvailable()) {
                throw new RuntimeException("Item not available or insufficient quantity: " + menuItem.getName());
            }

            // Deduct quantity
            menuItem.setAvailableQuantity(menuItem.getAvailableQuantity() - itemDto.getQuantity());
            menuItemRepository.save(menuItem);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemDto.getQuantity())
                    .price(menuItem.getPrice())
                    .build();

            order.getItems().add(orderItem);
            total = total.add(menuItem.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())));
        }

        order.setTotalAmount(total);
        return orderRecordRepository.save(order);
    }

    public List<OrderRecord> getAllOrders() {
        return orderRecordRepository.findAll();
    }

    @Transactional
    public OrderRecord updateOrderStatus(Long orderId, OrderStatus newStatus) {
        OrderRecord order = orderRecordRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(newStatus);
        if (newStatus == OrderStatus.SERVED) {
            order.setCompletedAt(LocalDateTime.now());
        }

        return orderRecordRepository.save(order);
    }
}
