package com.orderMS.orderMS.service;

import com.orderMS.orderMS.model.MenuItem;
import com.orderMS.orderMS.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> getAvailableMenuItems() {
        return menuItemRepository.findByIsAvailableTrue();
    }

    public MenuItem addMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    public MenuItem updateMenuItem(Long id, MenuItem updatedItem) {
        return menuItemRepository.findById(id).map(item -> {
            item.setName(updatedItem.getName());
            item.setDescription(updatedItem.getDescription());
            item.setPrice(updatedItem.getPrice());
            item.setAvailableQuantity(updatedItem.getAvailableQuantity());
            item.setCategory(updatedItem.getCategory());
            item.setIsAvailable(updatedItem.getIsAvailable());
            return menuItemRepository.save(item);
        }).orElseThrow(() -> new RuntimeException("MenuItem not found"));
    }

    public MenuItem updateAvailability(Long id, Integer quantity, Boolean isAvailable) {
        return menuItemRepository.findById(id).map(item -> {
            if (quantity != null) item.setAvailableQuantity(quantity);
            if (isAvailable != null) item.setIsAvailable(isAvailable);
            return menuItemRepository.save(item);
        }).orElseThrow(() -> new RuntimeException("MenuItem not found"));
    }
}
