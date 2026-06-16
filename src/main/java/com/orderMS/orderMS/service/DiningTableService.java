package com.orderMS.orderMS.service;

import com.orderMS.orderMS.model.DiningTable;
import com.orderMS.orderMS.repository.DiningTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiningTableService {

    private final DiningTableRepository diningTableRepository;

    public List<DiningTable> getAllTables() {
        return diningTableRepository.findAll();
    }

    public DiningTable addTable(DiningTable diningTable) {
        if (diningTableRepository.findByTableNumber(diningTable.getTableNumber()).isPresent()) {
            throw new RuntimeException("Table number already exists");
        }
        if (diningTable.getIsOccupied() == null) {
            diningTable.setIsOccupied(false);
        }
        return diningTableRepository.save(diningTable);
    }

    @Transactional
    public DiningTable updateTableOccupancy(Integer tableNumber, Boolean isOccupied) {
        DiningTable table = diningTableRepository.findByTableNumber(tableNumber)
                .orElseThrow(() -> new RuntimeException("Table " + tableNumber + " not found"));
        table.setIsOccupied(isOccupied);
        return diningTableRepository.save(table);
    }

    public void deleteTable(Long id) {
        if (!diningTableRepository.existsById(id)) {
            throw new RuntimeException("Table not found");
        }
        diningTableRepository.deleteById(id);
    }
}
