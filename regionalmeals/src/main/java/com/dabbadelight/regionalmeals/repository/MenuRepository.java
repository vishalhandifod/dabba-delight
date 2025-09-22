package com.dabbadelight.regionalmeals.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dabbadelight.regionalmeals.model.Kitchen.Menu;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    
    // Find active menus ordered by creation date
    List<Menu> findByIsActiveTrueOrderByCreatedAtDesc();
    
    // Find menus by creator
    List<Menu> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    List<Menu> findByCreatedBy(String createdBy);

    // Find active menus by creator
    List<Menu> findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(String createdBy);
    
    // Find menus by rating range
    List<Menu> findByRatingBetweenOrderByRatingDesc(int minRating, int maxRating);
    
    // Find active menus with rating above threshold
    List<Menu> findByIsActiveTrueAndRatingGreaterThanEqualOrderByRatingDesc(int minRating);
    
    // Custom query to find menus with items count
    @Query("SELECT m FROM Menu m LEFT JOIN m.items i WHERE m.isActive = true GROUP BY m.id HAVING COUNT(i) > 0 ORDER BY m.createdAt DESC")
    List<Menu> findActiveMenusWithItems();
    
    // Find menus by name containing (case insensitive search)
    List<Menu> findByNameContainingIgnoreCaseAndIsActiveTrueOrderByCreatedAtDesc(String name);
    
    // Count active menus by creator
    @Query("SELECT COUNT(m) FROM Menu m WHERE m.createdBy = :createdBy AND m.isActive = true")
    long countActiveMenusByCreatedBy(@Param("createdBy") String createdBy);
}