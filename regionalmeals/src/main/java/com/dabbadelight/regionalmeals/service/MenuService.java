package com.dabbadelight.regionalmeals.service;

import java.util.List;
import com.dabbadelight.regionalmeals.model.Kitchen.Menu;

public interface MenuService {
    // Basic CRUD operations
    Menu createMenu(Menu menu);
    Menu getMenuById(Long id);
    List<Menu> getAllMenus();
    List<Menu> getActiveMenus();
    Menu updateMenu(Long id, Menu menu);
    void deleteMenu(Long id);
    
    // Status operations
    Menu toggleMenuStatus(Long id, String updatedBy);
    
    // Rating operations
    Menu updateRating(Long id, int rating, String updatedBy);
    
    // User-specific operations
    List<Menu> getMenusByCreatedBy(String createdBy);
}