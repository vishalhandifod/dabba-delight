package com.dabbadelight.regionalmeals.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dabbadelight.regionalmeals.model.Orders.Order;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.model.enums.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>{

    List<Order> findByUserAndOrderStatus(User user, OrderStatus orderStatus);
    List<Order> findByOrderStatusOrderByCreatedAtDesc(OrderStatus orderStatus);
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    // Use this method - it's the correct one for your entity structure
    List<Order> findByAdmin_IdIn(List<Long> menuIds);

    List<Order> findByOrderStatus(OrderStatus orderStatus);

 @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.user " +
           "LEFT JOIN FETCH o.address " +
           "LEFT JOIN FETCH o.admin " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.item " +
           "WHERE o.admin.id IN :menuIds " +
           "ORDER BY o.createdAt DESC")
    List<Order> findOrdersByMenuIdsWithDetails(@Param("menuIds") List<Long> menuIds);
}

