package com.dabbadelight.regionalmeals.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.dabbadelight.regionalmeals.model.Kitchen.Item;
import com.dabbadelight.regionalmeals.model.Kitchen.Menu;
import com.dabbadelight.regionalmeals.service.ItemService;
import com.dabbadelight.regionalmeals.service.MenuService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/menu")
public class ItemController {

    private final ItemService itemService;
    private final MenuService menuService;
    private static final Logger logger = LoggerFactory.getLogger(ItemController.class);

    public ItemController(ItemService itemService, MenuService menuService) {
        this.itemService = itemService;
        this.menuService = menuService;
    }

    // ========================= CREATE =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{menuId}/item")
    public ResponseEntity<Item> createItem(@PathVariable Long menuId, @Valid @RequestBody Item item) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Menu menu = menuService.getMenuById(menuId);
        item.setMenu(menu);
        item.setCreatedBy(auth.getName());
        Item savedItem = itemService.createItem(item);
        logger.info("Item created by {}: {}", auth.getName(), savedItem.getId());
        return ResponseEntity.status(201).body(savedItem);
    }

    // ========================= READ =========================

    // Fetch all menus along with their items (for USER view)
    @PreAuthorize("hasAnyRole('USER','ADMIN','SUPERADMIN')")
    @GetMapping("/all-with-items")
    public ResponseEntity<List<Menu>> getMenusWithItems() {
        List<Menu> menus = menuService.getActiveMenus(); // only active menus
        menus.forEach(menu -> menu.setItems(itemService.getItemsByMenuId(menu.getId())));
        return ResponseEntity.ok(menus);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','USER')")
    @GetMapping("/{menuId}/items")
    public ResponseEntity<List<Item>> getItemsByMenu(@PathVariable Long menuId) {
        return ResponseEntity.ok(itemService.getItemsByMenuId(menuId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN','USER')")
    @GetMapping("/{menuId}/item/{itemId}")
    public ResponseEntity<Item> getItemByMenu(@PathVariable Long menuId, @PathVariable Long itemId) {
        Item item = itemService.getItemById(itemId);
        if (item.getMenu().getId().equals(menuId)) {
            return ResponseEntity.ok(item);
        } else {
            return ResponseEntity.status(404).body(null);
        }
    }

    // Filtered endpoints
    @GetMapping("/{menuId}/items/available")
    public ResponseEntity<List<Item>> getAvailableItemsByMenu(@PathVariable Long menuId) {
        return ResponseEntity.ok(itemService.getAvailableItemsByMenuId(menuId));
    }

    @GetMapping("/{menuId}/items/vegetarian")
    public ResponseEntity<List<Item>> getVegetarianItemsByMenu(@PathVariable Long menuId) {
        return ResponseEntity.ok(itemService.getVegetarianItemsByMenuId(menuId));
    }

    @GetMapping("/{menuId}/items/non-vegetarian")
    public ResponseEntity<List<Item>> getNonVegetarianItemsByMenu(@PathVariable Long menuId) {
        return ResponseEntity.ok(itemService.getNonVegetarianItemsByMenuId(menuId));
    }

    // ========================= UPDATE =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{menuId}/item/{itemId}")
    public ResponseEntity<Item> updateItem(@PathVariable Long menuId, @PathVariable Long itemId,
                                           @Valid @RequestBody Item item) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        item.setUpdatedBy(auth.getName());
        Item updatedItem = itemService.updateItem(itemId, item);
        return ResponseEntity.ok(updatedItem);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{menuId}/item/{itemId}/toggle-availability")
    public ResponseEntity<Item> toggleItemAvailability(@PathVariable Long menuId, @PathVariable Long itemId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Item updatedItem = itemService.toggleItemAvailability(itemId, auth.getName());
        return ResponseEntity.ok(updatedItem);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{menuId}/item/{itemId}/stock")
    public ResponseEntity<Item> updateItemStock(@PathVariable Long menuId, @PathVariable Long itemId,
                                                @RequestParam int stock) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Item updatedItem = itemService.updateStock(itemId, stock, auth.getName());
        return ResponseEntity.ok(updatedItem);
    }

    // ========================= DELETE =========================
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{menuId}/item/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long menuId, @PathVariable Long itemId) {
        itemService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
