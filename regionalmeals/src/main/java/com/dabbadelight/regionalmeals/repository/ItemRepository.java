package com.dabbadelight.regionalmeals.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dabbadelight.regionalmeals.model.Kitchen.Item;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    
    // Basic menu-related queries
    List<Item> findByMenuId(Long menuId);
    List<Item> findByMenuIdAndIsAvailableTrue(Long menuId);
    List<Item> findByMenuIdAndIsVegTrue(Long menuId);
    List<Item> findByMenuIdAndIsVegFalse(Long menuId);
    
    // Availability queries
    List<Item> findByIsAvailableTrueOrderByCreatedAtDesc();
    List<Item> findByIsAvailableFalseOrderByCreatedAtDesc();
    
    // Creator queries
    List<Item> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    List<Item> findByCreatedByAndIsAvailableTrueOrderByCreatedAtDesc(String createdBy);
    
    // Search queries
    List<Item> findByNameContainingIgnoreCaseAndIsAvailableTrue(String name);
    List<Item> findByDetailsContainingIgnoreCaseAndIsAvailableTrue(String details);
    
    // Price-related queries
    List<Item> findByPriceBetweenAndIsAvailableTrueOrderByPriceAsc(double minPrice, double maxPrice);
    List<Item> findByPriceLessThanEqualAndIsAvailableTrueOrderByPriceAsc(double maxPrice);
    List<Item> findByPriceGreaterThanEqualAndIsAvailableTrueOrderByPriceAsc(double minPrice);
    
    // Stock-related queries
    List<Item> findByStockLessThanAndIsAvailableTrueOrderByStockAsc(int threshold);
    List<Item> findByStockGreaterThanAndIsAvailableTrueOrderByStockDesc(int threshold);
    List<Item> findByStockEqualsAndIsAvailableTrue(int stock);
    
    // Vegetarian queries
    List<Item> findByIsVegTrueAndIsAvailableTrueOrderByCreatedAtDesc();
    List<Item> findByIsVegFalseAndIsAvailableTrueOrderByCreatedAtDesc();
    
    // Combined queries
    List<Item> findByMenuIdAndIsVegAndIsAvailableTrueOrderByCreatedAtDesc(Long menuId, boolean isVeg);
    List<Item> findByMenuIdAndPriceLessThanEqualAndIsAvailableTrueOrderByPriceAsc(Long menuId, double maxPrice);
    
    // Custom queries
    @Query("SELECT i FROM Item i WHERE i.menu.id = :menuId AND i.isAvailable = true AND i.stock > 0 ORDER BY i.name ASC")
    List<Item> findAvailableItemsWithStockByMenuId(@Param("menuId") Long menuId);
    
    @Query("SELECT i FROM Item i WHERE i.isAvailable = true AND i.stock <= :threshold ORDER BY i.stock ASC")
    List<Item> findLowStockItems(@Param("threshold") int threshold);
    
    @Query("SELECT COUNT(i) FROM Item i WHERE i.menu.id = :menuId AND i.isAvailable = true")
    long countAvailableItemsByMenuId(@Param("menuId") Long menuId);
    
    @Query("SELECT AVG(i.price) FROM Item i WHERE i.menu.id = :menuId AND i.isAvailable = true")
    Double getAveragePriceByMenuId(@Param("menuId") Long menuId);
    
    @Query("SELECT i FROM Item i WHERE i.name LIKE %:keyword% OR i.details LIKE %:keyword% AND i.isAvailable = true ORDER BY i.createdAt DESC")
    List<Item> searchAvailableItems(@Param("keyword") String keyword);
}