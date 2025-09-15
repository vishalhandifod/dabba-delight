package com.dabbadelight.regionalmeals.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dabbadelight.regionalmeals.model.Kitchen.Menu;
import com.dabbadelight.regionalmeals.repository.MenuRepository;
import com.dabbadelight.regionalmeals.service.MenuService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class MenuServiceImpl implements MenuService{

    private final MenuRepository menuRepository;
    

    public MenuServiceImpl (MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    @Override
    public Menu createMenu(Menu menu) {
        return menuRepository.save(menu);
    }

    @Override
    public Menu getMenuById(Long id) {
        return menuRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Menu not found with ID: " + id));
    }

    @Override
    public List<Menu> getAllMenus() {
        return menuRepository.findAll();
    }

    @Override
    public Menu updateMenu(Long id, Menu menu) {
        Menu updatedMenu = getMenuById(id);
        updatedMenu.setName(menu.getName());
        updatedMenu.setDetails(menu.getDetails());
        updatedMenu.setRating(menu.getRating());

        return menuRepository.save(updatedMenu);
    }

    @Override
    public void deleteMenu(Long id) {
        Menu menu = getMenuById(id);
        menuRepository.delete(menu);
    }
}
