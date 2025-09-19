package com.dabbadelight.regionalmeals.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.dabbadelight.regionalmeals.model.Kitchen.Menu;
import com.dabbadelight.regionalmeals.service.MenuService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/menus")
public class MenuController {

    private final MenuService menuService;
    private static final Logger logger = LoggerFactory.getLogger(MenuController.class);

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    // ========================= CREATE =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createMenu(@Valid @RequestBody Menu menu) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            menu.setCreatedBy(auth.getName());
            Menu savedMenu = menuService.createMenu(menu);
            logger.info("Menu created by {}: {}", auth.getName(), savedMenu.getId());
            return ResponseEntity.status(201).body(savedMenu);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating menu", e);
            return ResponseEntity.status(500).body("Error creating menu: " + e.getMessage());
        }
    }

    // ========================= READ =========================
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Menu> getMenuById(@PathVariable Long id) {
        Menu menu = menuService.getMenuById(id);
        return ResponseEntity.ok(menu);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    @GetMapping
    public ResponseEntity<List<Menu>> getAllMenus(@RequestParam(defaultValue = "false") boolean includeInactive) {
        List<Menu> menus = includeInactive ? menuService.getAllMenus() : menuService.getActiveMenus();
        return ResponseEntity.ok(menus);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Menu>> getActiveMenus() {
        return ResponseEntity.ok(menuService.getActiveMenus());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/my-menus")
    public ResponseEntity<List<Menu>> getMyMenus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<Menu> menus = menuService.getMenusByCreatedBy(auth.getName());
        return ResponseEntity.ok(menus);
    }

    // ========================= UPDATE =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenu(@PathVariable Long id, @Valid @RequestBody Menu menu) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            menu.setUpdatedBy(auth.getName());
            Menu updatedMenu = menuService.updateMenu(id, menu);
            return ResponseEntity.ok(updatedMenu);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating menu", e);
            return ResponseEntity.status(500).body("Error updating menu: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleMenuStatus(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Menu updatedMenu = menuService.toggleMenuStatus(id, auth.getName());
        return ResponseEntity.ok(updatedMenu);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/rating")
    public ResponseEntity<?> updateMenuRating(@PathVariable Long id, @RequestParam int rating) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Menu updatedMenu = menuService.updateRating(id, rating, auth.getName());
        return ResponseEntity.ok(updatedMenu);
    }

    // ========================= DELETE =========================
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return ResponseEntity.noContent().build();
    }
}
