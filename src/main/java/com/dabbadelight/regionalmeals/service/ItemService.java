package com.dabbadelight.regionalmeals.service;

import java.util.List;
import com.dabbadelight.regionalmeals.model.Kitchen.Item;

public interface ItemService {
    // Basic CRUD operations
    Item createItem(Item item);
    Item getItemById(Long id);
    List<Item> getAllItems();
    Item updateItem(Long id, Item item);
    void deleteItem(Long id);
    
    // Menu-specific operations
    List<Item> getItemsByMenuId(Long menuId);
    List<Item> getAvailableItemsByMenuId(Long menuId);
    List<Item> getVegetarianItemsByMenuId(Long menuId);
    List<Item> getNonVegetarianItemsByMenuId(Long menuId);
    
    // Availability operations
    Item toggleItemAvailability(Long id, String updatedBy);
    
    // Stock operations
    Item updateStock(Long id, int newStock, String updatedBy);
    Item increaseStock(Long id, int amount, String updatedBy);
    Item decreaseStock(Long id, int amount, String updatedBy);
    
    // Search operations
    List<Item> searchItemsByName(String name);
    List<Item> getItemsByPriceRange(double minPrice, double maxPrice);
    List<Item> getLowStockItems(int threshold);
}