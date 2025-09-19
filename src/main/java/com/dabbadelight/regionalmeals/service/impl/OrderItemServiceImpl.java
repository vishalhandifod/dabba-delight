package com.dabbadelight.regionalmeals.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dabbadelight.regionalmeals.model.Orders.OrderItem;
import com.dabbadelight.regionalmeals.repository.OrderItemRepository;
import com.dabbadelight.regionalmeals.service.OrderItemService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class OrderItemServiceImpl implements OrderItemService{

    private final OrderItemRepository orderItemRepository;
    public OrderItemServiceImpl(OrderItemRepository orderItemRepository) {
        this.orderItemRepository = orderItemRepository;
    }

    @Override
    public OrderItem createOrderItem(OrderItem orderItem) {
        return orderItemRepository.save(orderItem);
    }

    @Override
    public OrderItem getOrderItemById(Long id) {
        return orderItemRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Order Item with ID not found: " + id));
    }

    @Override
    public List<OrderItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    @Override
    public OrderItem updateOrderItem(Long id, OrderItem orderItem) {
        OrderItem updatedOrderItem = getOrderItemById(id);
        updatedOrderItem.setQuantity(orderItem.getQuantity());
        updatedOrderItem.setPriceAtPurchase(orderItem.getPriceAtPurchase());
        return orderItemRepository.save(updatedOrderItem);
    }

    @Override
    public void deleteOrderItem(Long id) {
        OrderItem orderItem = getOrderItemById(id);
        orderItemRepository.delete(orderItem);
    }

}
