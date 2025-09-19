package com.dabbadelight.regionalmeals.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dabbadelight.regionalmeals.model.Orders.Order;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.model.enums.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>{

    List<Order> findByUserAndOrderStatus(User user, OrderStatus orderStatus);
    List<Order> findByOrderStatusOrderByCreatedAtDesc(OrderStatus orderStatus);
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    List<Order> findByOrderStatus(OrderStatus orderStatus);

}

