package com.dabbadelight.regionalmeals.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dabbadelight.regionalmeals.exception.ResourceNotFoundException;
import com.dabbadelight.regionalmeals.model.Kitchen.Menu;
import com.dabbadelight.regionalmeals.repository.MenuRepository;
import com.dabbadelight.regionalmeals.service.MenuService;

@Service
public class MenuServiceImpl implements MenuService {

    private final MenuRepository menuRepository;

    public MenuServiceImpl(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    @Override
    public Menu createMenu(Menu menu) {
        // Validate rating
        if (menu.getRating() < 0 || menu.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }
        
        // Set default values if not provided
        if (menu.getRating() == 0) {
            menu.setRating(0);
        }
        
        return menuRepository.save(menu);
    }

    @Override
    public Menu getMenuById(Long id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found with id: " + id));
    }

    @Override
    public List<Menu> getAllMenus() {
        return menuRepository.findAll();
    }

    @Override
    public List<Menu> getActiveMenus() {
        return menuRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    @Override
    public Menu updateMenu(Long id, Menu menuDetails) {
        Menu menu = getMenuById(id);
        
        // Validate rating
        if (menuDetails.getRating() < 0 || menuDetails.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }
        
        menu.setName(menuDetails.getName());
        menu.setDetails(menuDetails.getDetails());
        menu.setRating(menuDetails.getRating());
        menu.setActive(menuDetails.isActive());
        menu.setUpdatedBy(menuDetails.getUpdatedBy());
        
        return menuRepository.save(menu);
    }

    @Override
    public Menu toggleMenuStatus(Long id, String updatedBy) {
        Menu menu = getMenuById(id);
        menu.setActive(!menu.isActive());
        menu.setUpdatedBy(updatedBy);
        return menuRepository.save(menu);
    }

    @Override
    public void deleteMenu(Long id) {
        Menu menu = getMenuById(id);
        // You might want to check if there are any items associated with this menu
        // and handle them accordingly (cascade delete or prevent deletion)
        menuRepository.delete(menu);
    }

    @Override
    public List<Menu> getMenusByCreatedBy(String createdBy) {
        return menuRepository.findByCreatedByOrderByCreatedAtDesc(createdBy);
    }

    @Override
    public Menu updateRating(Long id, int rating, String updatedBy) {
        Menu menu = getMenuById(id);
        
        if (rating < 0 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }
        
        menu.setRating(rating);
        menu.setUpdatedBy(updatedBy);
        return menuRepository.save(menu);
    }
}