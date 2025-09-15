package com.dabbadelight.regionalmeals.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dabbadelight.regionalmeals.model.Kitchen.Item;
import com.dabbadelight.regionalmeals.repository.ItemRepository;
import com.dabbadelight.regionalmeals.service.ItemService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;

    public ItemServiceImpl(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    public Item createItem(Item item) {
        return itemRepository.save(item);
    }

    @Override
    public Item getItemById(Long id) {
        return itemRepository.findById(id).orElseThrow(()-> new EntityNotFoundException("Item with ID not found: " + id));
    }

    @Override
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @Override
    public Item updateItem(Long id, Item item) {
        Item itemDetails = getItemById(id);
        itemDetails.setName(item.getName());
        itemDetails.setDetails(item.getDetails());
        itemDetails.setPrice(item.getPrice());
        itemDetails.setStock(item.getStock());
        itemDetails.setVeg(item.isVeg());
        return itemRepository.save(itemDetails);
    }

    @Override
    public void deleteItem(Long id) {
        Item item = getItemById(id);
        itemRepository.delete(item);
    }

    @Override
    public List<Item> getItemsByMenuId(Long menuId) {
        return itemRepository.findByMenuId(menuId);
    }

}
