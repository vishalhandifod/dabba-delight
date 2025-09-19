package com.dabbadelight.regionalmeals.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/items")
@PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
public class AdminItemController {

    // ✅ Example: Add a new item
    @PostMapping("/add")
    public String addItem(@RequestBody String itemName) {
        return "Item added successfully: " + itemName;
    }

    // ✅ Example: View all items
    @GetMapping("/all")
    public String getAllItems() {
        return "Here are all items (admin only)";
    }

    // ✅ Example: Delete an item
    @DeleteMapping("/{id}")
    public String deleteItem(@PathVariable Long id) {
        return "Item deleted with ID: " + id;
    }
}

