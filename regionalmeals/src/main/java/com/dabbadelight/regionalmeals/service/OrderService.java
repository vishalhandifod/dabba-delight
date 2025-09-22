package com.dabbadelight.regionalmeals.service;

import java.util.List;

import com.dabbadelight.regionalmeals.model.DTO.OrderRequestDTO;
import com.dabbadelight.regionalmeals.model.DTO.OrderResponseDTO;
import com.dabbadelight.regionalmeals.model.Orders.Order;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.model.enums.OrderStatus;
import jakarta.transaction.Transactional;

public interface OrderService {

    // --------------------- CREATE ORDER ---------------------
    OrderResponseDTO createOrder(OrderRequestDTO request);

    // --------------------- GET ORDERS ---------------------
    OrderResponseDTO getOrderById(Long id);
    List<OrderResponseDTO> getAllOrders();
    List<OrderResponseDTO> getOrdersByUserId(Long userId);
    List<OrderResponseDTO> getOrdersByStatus(OrderStatus status);
     void sendOrderConfirmationEmail(Long orderId);

    // --------------------- ADMIN SPECIFIC ---------------------
    /**
     * Fetch orders visible to ADMIN role
     */
    List<OrderResponseDTO> getOrdersForAdmin(String adminEmail);
    void sendOrderStatusUpdateEmail(Order order, OrderStatus newStatus);

    /**
     * Update order status (e.g., CONFIRMED, PREPARING, DELIVERED, CANCELLED)
     * Only ADMIN can update
     */
    @Transactional
    Order updateOrderStatus(Long id, OrderStatus status, User currentUser);

    // --------------------- CURRENT LOGGED-IN USER ---------------------
    User getCurrentLoggedInUser();

    // --------------------- UPDATE / DELETE ORDER ---------------------
    @Transactional
    Order updateOrder(Long id, Order order);
    @Transactional
    void deleteOrder(Long id);

    Order getOrderEntityById(Long id);

    // --------------------- CART FUNCTIONALITY ---------------------
    Order getOrCreatePendingOrderByUserId(Long userId);
    Order addItemToOrder(Long orderId, Long itemId, int quantity);
    Order removeItemFromOrder(Long orderId, Long orderItemId);
}
