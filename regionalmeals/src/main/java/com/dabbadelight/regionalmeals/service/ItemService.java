package com.dabbadelight.regionalmeals.service;

import java.util.List;

import com.dabbadelight.regionalmeals.model.Kitchen.Item;

public interface ItemService {

    Item createItem(Item item);
    Item getItemById(Long id);
    List<Item> getAllItems();
    List<Item> getItemsByMenuId(Long menuId);
    Item updateItem(Long id, Item item);
    void deleteItem(Long id);

}
