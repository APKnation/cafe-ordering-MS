package com.orderMS.orderMS.controller;

import com.orderMS.orderMS.model.DiningTable;
import com.orderMS.orderMS.service.DiningTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DiningTableController {

    private final DiningTableService diningTableService;

    @GetMapping
    public ResponseEntity<List<DiningTable>> getAllTables() {
        return ResponseEntity.ok(diningTableService.getAllTables());
    }

    @PostMapping
    public ResponseEntity<DiningTable> addTable(@RequestBody DiningTable diningTable) {
        return ResponseEntity.ok(diningTableService.addTable(diningTable));
    }

    @PostMapping("/{tableNumber}/occupy")
    public ResponseEntity<DiningTable> occupyTable(@PathVariable Integer tableNumber) {
        return ResponseEntity.ok(diningTableService.updateTableOccupancy(tableNumber, true));
    }

    @PostMapping("/{tableNumber}/vacate")
    public ResponseEntity<DiningTable> vacateTable(@PathVariable Integer tableNumber) {
        return ResponseEntity.ok(diningTableService.updateTableOccupancy(tableNumber, false));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        diningTableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }
}
