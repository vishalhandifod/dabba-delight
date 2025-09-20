package com.dabbadelight.regionalmeals.service;

import java.util.List;

import com.dabbadelight.regionalmeals.model.DTO.OrderRequestDTO;
import com.dabbadelight.regionalmeals.model.DTO.OrderResponseDTO;
import com.dabbadelight.regionalmeals.model.Orders.Order;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.model.enums.OrderStatus;
import jakarta.transaction.Transactional;

public interface OrderService {

    // Create new order
    OrderResponseDTO createOrder(OrderRequestDTO request);

    // Get orders
    OrderResponseDTO getOrderById(Long id);
    List<OrderResponseDTO> getAllOrders();
    List<OrderResponseDTO> getOrdersByUserId(Long userId);
    List<OrderResponseDTO> getOrdersByStatus(OrderStatus status);

    User getCurrentLoggedInUser();

    // Update orders
    Order updateOrder(Long id, Order order);
    @Transactional
    Order updateOrderStatus(Long id, OrderStatus status, User currentUser);

    // Delete order
    void deleteOrder(Long id);

    // Cart functionality
    Order getOrCreatePendingOrderByUserId(Long userId);
    Order addItemToOrder(Long orderId, Long itemId, int quantity);
    Order removeItemFromOrder(Long orderId, Long orderItemId);
}