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

import com.dabbadelight.regionalmeals.model.Kitchen.Menu;
import com.dabbadelight.regionalmeals.service.MenuService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @PostMapping
    public ResponseEntity<?> createMenu(@Valid @RequestBody Menu menu) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (!hasAdminRole(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Admin privileges required.");
            }

            menu.setCreatedBy(auth.getName());
            Menu savedMenu = menuService.createMenu(menu);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMenu);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating menu: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Menu> getMenuById(@PathVariable Long id) {
        Menu menu = menuService.getMenuById(id);
        return ResponseEntity.ok(menu);
    }

    @GetMapping
    public ResponseEntity<List<Menu>> getAllMenus(@RequestParam(defaultValue = "false") boolean includeInactive) {
        List<Menu> menus;
        if (includeInactive) {
            menus = menuService.getAllMenus();
        } else {
            menus = menuService.getActiveMenus();
        }
        return ResponseEntity.ok(menus);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Menu>> getActiveMenus() {
        List<Menu> activeMenus = menuService.getActiveMenus();
        return ResponseEntity.ok(activeMenus);
    }

    @GetMapping("/my-menus")
    public ResponseEntity<?> getMyMenus() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (!hasAdminRole(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Admin privileges required.");
            }

            List<Menu> menus = menuService.getMenusByCreatedBy(auth.getName());
            return ResponseEntity.ok(menus);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching menus: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenu(@PathVariable Long id, @Valid @RequestBody Menu menu) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (!hasAdminRole(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Admin privileges required.");
            }

            menu.setUpdatedBy(auth.getName());
            Menu updatedMenu = menuService.updateMenu(id, menu);
            return ResponseEntity.ok(updatedMenu);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating menu: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleMenuStatus(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (!hasAdminRole(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Admin privileges required.");
            }

            Menu updatedMenu = menuService.toggleMenuStatus(id, auth.getName());
            return ResponseEntity.ok(updatedMenu);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating menu status: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/rating")
    public ResponseEntity<?> updateMenuRating(@PathVariable Long id, @RequestParam int rating) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (!hasAdminRole(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Admin privileges required.");
            }

            Menu updatedMenu = menuService.updateRating(id, rating, auth.getName());
            return ResponseEntity.ok(updatedMenu);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating menu rating: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenu(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (!hasAdminRole(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. Admin privileges required.");
            }

            menuService.deleteMenu(id);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting menu: " + e.getMessage());
        }
    }

    private boolean hasAdminRole(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                              a.getAuthority().equals("ROLE_SUPERADMIN"));
    }
}