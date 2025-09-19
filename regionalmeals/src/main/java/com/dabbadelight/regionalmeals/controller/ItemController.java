package com.dabbadelight.regionalmeals.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    public ItemController(ItemService itemService, MenuService menuService) {
        this.itemService = itemService;
        this.menuService = menuService;
    }

    @PostMapping("/menu/{menuId}")
    public ResponseEntity<?> createItem(@PathVariable Long menuId, @Valid @RequestBody Item item) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (!hasAdminRole(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Admin privileges required.");
            }

            Menu menu = menuService.getMenuById(menuId);
            item.setMenu(menu);
            item.setCreatedBy(auth.getName());
            
            Item savedItem = itemService.createItem(item);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating item: " + e.getMessage());
        }
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
    public ResponseEntity<List<Item>> getItemsByMenuId(@PathVariable Long menuId) {
        return ResponseEntity.ok(itemService.getItemsByMenuId(menuId));
    }

    @GetMapping("/menu/{menuId}/available")
    public ResponseEntity<List<Item>> getAvailableItemsByMenuId(@PathVariable Long menuId) {
        return ResponseEntity.ok(itemService.getAvailableItemsByMenuId(menuId));
    }

    @GetMapping("/menu/{menuId}/vegetarian")
    public ResponseEntity<List<Item>> getVegetarianItemsByMenuId(@PathVariable Long menuId) {
        return ResponseEntity.ok(itemService.getVegetarianItemsByMenuId(menuId));
    }

    @GetMapping("/menu/{menuId}/non-vegetarian")
    public ResponseEntity<List<Item>> getNonVegetarianItemsByMenuId(@PathVariable Long menuId) {
        return ResponseEntity.ok(itemService.getNonVegetarianItemsByMenuId(menuId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @Valid @RequestBody Item item) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (!hasAdminRole(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Admin privileges required.");
            }

            item.setUpdatedBy(auth.getName());
            Item updatedItem = itemService.updateItem(id, item);
            return ResponseEntity.ok(updatedItem);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating item: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/toggle-availability")
    public ResponseEntity<?> toggleItemAvailability(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (!hasAdminRole(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Admin privileges required.");
            }

            Item updatedItem = itemService.toggleItemAvailability(id, auth.getName());
            return ResponseEntity.ok(updatedItem);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating item availability: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateItemStock(@PathVariable Long id, @RequestParam int stock) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (!hasAdminRole(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Admin privileges required.");
            }

            Item updatedItem = itemService.updateStock(id, stock, auth.getName());
            return ResponseEntity.ok(updatedItem);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating item stock: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (!hasAdminRole(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Admin privileges required.");
            }

            itemService.deleteItem(id);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting item: " + e.getMessage());
        }
    }

    private boolean hasAdminRole(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                              a.getAuthority().equals("ROLE_SUPERADMIN"));
    }
}