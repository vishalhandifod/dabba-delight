package com.dabbadelight.regionalmeals.service;

import java.util.List;

import com.dabbadelight.regionalmeals.model.Kitchen.Menu;

public interface MenuService {

    Menu createMenu(Menu menu);
    Menu getMenuById(Long id);
    List<Menu> getAllMenus();
    Menu updateMenu(Long id, Menu menu);
    void deleteMenu(Long id);

}
