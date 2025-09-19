package com.dabbadelight.regionalmeals.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dabbadelight.regionalmeals.exception.ResourceNotFoundException;
import com.dabbadelight.regionalmeals.model.Kitchen.Item;
import com.dabbadelight.regionalmeals.repository.ItemRepository;
import com.dabbadelight.regionalmeals.service.ItemService;

@Service
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;

    public ItemServiceImpl(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    public Item createItem(Item item) {
        // Validate stock
        if (item.getStock() < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }
        
        // Validate price
        if (item.getPrice() < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        
        return itemRepository.save(item);
    }

    @Override
    public Item getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
    }

    @Override
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @Override
    public List<Item> getItemsByMenuId(Long menuId) {
        return itemRepository.findByMenuId(menuId);
    }

    @Override
    public List<Item> getAvailableItemsByMenuId(Long menuId) {
        return itemRepository.findByMenuIdAndIsAvailableTrue(menuId);
    }

    @Override
    public Item updateItem(Long id, Item itemDetails) {
        Item item = getItemById(id);
        
        // Validate before updating
        if (itemDetails.getStock() < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }
        
        if (itemDetails.getPrice() < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        
        item.setName(itemDetails.getName());
        item.setDetails(itemDetails.getDetails());
        item.setPrice(itemDetails.getPrice());
        item.setStock(itemDetails.getStock());
        item.setVeg(itemDetails.isVeg());
        item.setAvailable(itemDetails.isAvailable());
        item.setUpdatedBy(itemDetails.getUpdatedBy());
        
        return itemRepository.save(item);
    }

    @Override
    public Item toggleItemAvailability(Long id, String updatedBy) {
        Item item = getItemById(id);
        item.setAvailable(!item.isAvailable());
        item.setUpdatedBy(updatedBy);
        return itemRepository.save(item);
    }

    @Override
    public void deleteItem(Long id) {
        Item item = getItemById(id);
        itemRepository.delete(item);
    }

    @Override
    public Item updateStock(Long id, int newStock, String updatedBy) {
        Item item = getItemById(id);
        if (newStock < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }
        item.setStock(newStock);
        item.setUpdatedBy(updatedBy);
        return itemRepository.save(item);
    }

    @Override
    public Item increaseStock(Long id, int amount, String updatedBy) {
        Item item = getItemById(id);
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        item.setStock(item.getStock() + amount);
        item.setUpdatedBy(updatedBy);
        return itemRepository.save(item);
    }

    @Override
    public Item decreaseStock(Long id, int amount, String updatedBy) {
        Item item = getItemById(id);
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        int newStock = item.getStock() - amount;
        if (newStock < 0) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + item.getStock());
        }
        item.setStock(newStock);
        item.setUpdatedBy(updatedBy);
        return itemRepository.save(item);
    }

    @Override
    public List<Item> getVegetarianItemsByMenuId(Long menuId) {
        return itemRepository.findByMenuIdAndIsVegTrue(menuId);
    }

    @Override
    public List<Item> getNonVegetarianItemsByMenuId(Long menuId) {
        return itemRepository.findByMenuIdAndIsVegFalse(menuId);
    }

    @Override
    public List<Item> searchItemsByName(String name) {
        return itemRepository.findByNameContainingIgnoreCaseAndIsAvailableTrue(name);
    }

    @Override
    public List<Item> getItemsByPriceRange(double minPrice, double maxPrice) {
        return itemRepository.findByPriceBetweenAndIsAvailableTrueOrderByPriceAsc(minPrice, maxPrice);
    }

    @Override
    public List<Item> getLowStockItems(int threshold) {
        return itemRepository.findByStockLessThanAndIsAvailableTrueOrderByStockAsc(threshold);
    }
}