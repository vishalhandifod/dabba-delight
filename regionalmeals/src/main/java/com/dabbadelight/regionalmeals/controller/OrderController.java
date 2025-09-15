package com.dabbadelight.regionalmeals.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dabbadelight.regionalmeals.model.DTO.OrderRequestDTO;
import com.dabbadelight.regionalmeals.model.DTO.OrderResponseDTO;
import com.dabbadelight.regionalmeals.model.Orders.Order;
import com.dabbadelight.regionalmeals.service.OrderService;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    private final OrderService orderService;

    public OrderController (OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody OrderRequestDTO orderRequest) {
        OrderResponseDTO savedOrder = orderService.createOrder(orderRequest);
        return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);
    }

    
    @GetMapping("{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long id) {
        OrderResponseDTO orderItem = orderService.getOrderById(id);
        return ResponseEntity.ok(orderItem);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody Order order) {
        Order updatedOrder = orderService.updateOrder(id, order);
        return ResponseEntity.ok(updatedOrder);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}/pending")
    public ResponseEntity<Order> getOrCreatePendingOrder(@PathVariable Long userId) {
        Order order = orderService.getOrCreatePendingOrderByUserId(userId);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/items")
    public ResponseEntity<Order> addItemToOrder(@PathVariable Long orderId, @RequestBody Map<String, Object> payload) {
        Long itemId = Long.valueOf(payload.get("itemId").toString());
        int quantity = (int) payload.get("quantity");
        Order updatedOrder = orderService.addItemToOrder(orderId, itemId, quantity);
        return ResponseEntity.ok(updatedOrder);
    }

    @DeleteMapping("/{orderId}/items/{orderItemId}")
    public ResponseEntity<Order> removeItemFromOrder(@PathVariable Long orderId, @PathVariable Long orderItemId) {
        Order updatedOrder = orderService.removeItemFromOrder(orderId, orderItemId);
        return ResponseEntity.ok(updatedOrder);
    }
}
