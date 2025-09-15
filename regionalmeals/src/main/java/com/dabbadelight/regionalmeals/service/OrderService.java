package com.dabbadelight.regionalmeals.service;

import java.util.List;

import com.dabbadelight.regionalmeals.model.DTO.OrderRequestDTO;
import com.dabbadelight.regionalmeals.model.DTO.OrderResponseDTO;
import com.dabbadelight.regionalmeals.model.Orders.Order;


public interface OrderService {

    OrderResponseDTO createOrder(OrderRequestDTO request);
    OrderResponseDTO getOrderById(Long id);
    List<OrderResponseDTO> getAllOrders();
    Order updateOrder(Long id, Order order);
    void deleteOrder(Long id);
    Order getOrCreatePendingOrderByUserId(Long userId);
    Order addItemToOrder(Long orderId, Long itemId, int quantity);
    Order removeItemFromOrder(Long orderId, Long orderItemId);

}
