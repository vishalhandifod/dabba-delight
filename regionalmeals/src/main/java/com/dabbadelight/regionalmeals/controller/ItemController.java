package com.dabbadelight.regionalmeals.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dabbadelight.regionalmeals.model.Kitchen.Item;
import com.dabbadelight.regionalmeals.model.Kitchen.Menu;
import com.dabbadelight.regionalmeals.service.ItemService;
import com.dabbadelight.regionalmeals.service.MenuService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/item")
public class ItemController {

    private final ItemService itemService;
    private final MenuService menuService;

    public ItemController (ItemService itemService, MenuService menuService) {
        this.itemService = itemService;
        this.menuService = menuService;
    }

    @PostMapping("/menu/{menuId}/create-item")
    public ResponseEntity<Item> createItem(@PathVariable Long menuId, @Valid @RequestBody Item item) {
        Menu menu = menuService.getMenuById(menuId);
        item.setMenu(menu);
        Item savedItem = itemService.createItem(item);
        return new ResponseEntity<>(savedItem, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        Item item = itemService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/menu/{menuId}")
    public ResponseEntity<List<Item>> getItemByMenuId(@PathVariable Long menuId) {
        return ResponseEntity.ok(itemService.getItemsByMenuId(menuId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item item) {
        Item updatedItem = itemService.updateItem(id, item);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
    
}
