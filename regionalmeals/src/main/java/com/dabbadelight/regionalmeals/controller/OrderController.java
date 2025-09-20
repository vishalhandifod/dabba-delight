package com.dabbadelight.regionalmeals.controller;

import java.util.List;
import java.util.Map;

import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.model.enums.OrderStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody OrderRequestDTO orderRequest) {
        OrderResponseDTO savedOrder = orderService.createOrder(orderRequest);
        return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);
    }

    @GetMapping("{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long id) {
        OrderResponseDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> updateOrder(@PathVariable Long id, @RequestBody Order order) {
        Order updatedOrder = orderService.updateOrder(id, order);
        return ResponseEntity.ok(orderService.getOrderById(updatedOrder.getId()));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> statusRequest) {

        String statusStr = statusRequest.get("status");
        OrderStatus status;
        try {
            status = OrderStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        // Fetch the logged-in user from DB
        User currentUser = orderService.getCurrentLoggedInUser(); // make getCurrentLoggedInUser() public

        Order updatedOrder = orderService.updateOrderStatus(orderId, status, currentUser);
        return ResponseEntity.ok(orderService.getOrderById(updatedOrder.getId()));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}/pending")
    public ResponseEntity<OrderResponseDTO> getOrCreatePendingOrder(@PathVariable Long userId) {
        Order order = orderService.getOrCreatePendingOrderByUserId(userId);
        return ResponseEntity.ok(orderService.getOrderById(order.getId()));
    }

    @PostMapping("/{orderId}/items")
    public ResponseEntity<OrderResponseDTO> addItemToOrder(
            @PathVariable Long orderId,
            @RequestBody OrderRequestDTO.OrderItemRequestDTO itemRequest) {

        Order updatedOrder = orderService.addItemToOrder(orderId, itemRequest.getItemId(), itemRequest.getQuantity());
        return ResponseEntity.ok(orderService.getOrderById(updatedOrder.getId()));
    }

    @DeleteMapping("/{orderId}/items/{orderItemId}")
    public ResponseEntity<OrderResponseDTO> removeItemFromOrder(@PathVariable Long orderId,
                                                                @PathVariable Long orderItemId) {
        Order updatedOrder = orderService.removeItemFromOrder(orderId, orderItemId);
        return ResponseEntity.ok(orderService.getOrderById(updatedOrder.getId()));
    }
}
