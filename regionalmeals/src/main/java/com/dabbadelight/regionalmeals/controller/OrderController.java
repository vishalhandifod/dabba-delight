package com.dabbadelight.regionalmeals.controller;

import java.util.List;
import java.util.Map;

import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.model.enums.OrderStatus;
import com.dabbadelight.regionalmeals.model.enums.Role;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // ================= User Endpoints =================

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody OrderRequestDTO orderRequest) {
        User currentUser = orderService.getCurrentLoggedInUser();
        orderRequest.setUserId(currentUser.getId());
        OrderResponseDTO savedOrder = orderService.createOrder(orderRequest);
         orderService.sendOrderConfirmationEmail(savedOrder.getOrderId());
        return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);
    }

    @GetMapping("{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long id) {
        User currentUser = orderService.getCurrentLoggedInUser();
        OrderResponseDTO order = orderService.getOrderById(id);

        if (currentUser.getRole() != Role.ADMIN && !order.getUserId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        User currentUser = orderService.getCurrentLoggedInUser();
        List<OrderResponseDTO> orders = (currentUser.getRole() == Role.ADMIN)
                ? orderService.getAllOrders()
                : orderService.getOrdersByUserId(currentUser.getId());

                // System.out.println("fetched orders :" + orders);

        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> updateOrder(@PathVariable Long id, @RequestBody Order order) {
        User currentUser = orderService.getCurrentLoggedInUser();
        Order existingOrder = orderService.getOrderEntityById(id);

        if (currentUser.getRole() != Role.ADMIN && !existingOrder.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Order updatedOrder = orderService.updateOrder(id, order);
        return ResponseEntity.ok(orderService.getOrderById(updatedOrder.getId()));
    }

    @GetMapping("/user/{userId}/pending")
    public ResponseEntity<OrderResponseDTO> getOrCreatePendingOrder(@PathVariable Long userId) {
        User currentUser = orderService.getCurrentLoggedInUser();
        if (currentUser.getRole() != Role.ADMIN && !userId.equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Order order = orderService.getOrCreatePendingOrderByUserId(userId);
        return ResponseEntity.ok(orderService.getOrderById(order.getId()));
    }

    @PostMapping("/{orderId}/items")
    public ResponseEntity<OrderResponseDTO> addItemToOrder(
            @PathVariable Long orderId,
            @RequestBody OrderRequestDTO.OrderItemRequestDTO itemRequest) {

        User currentUser = orderService.getCurrentLoggedInUser();
        Order order = orderService.getOrderEntityById(orderId);

        if (currentUser.getRole() != Role.ADMIN && !order.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Order updatedOrder = orderService.addItemToOrder(orderId, itemRequest.getItemId(), itemRequest.getQuantity());
        return ResponseEntity.ok(orderService.getOrderById(updatedOrder.getId()));
    }

    @DeleteMapping("/{orderId}/items/{orderItemId}")
    public ResponseEntity<OrderResponseDTO> removeItemFromOrder(
            @PathVariable Long orderId,
            @PathVariable Long orderItemId) {

        User currentUser = orderService.getCurrentLoggedInUser();
        Order order = orderService.getOrderEntityById(orderId);

        if (currentUser.getRole() != Role.ADMIN && !order.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Order updatedOrder = orderService.removeItemFromOrder(orderId, orderItemId);
        return ResponseEntity.ok(orderService.getOrderById(updatedOrder.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        User currentUser = orderService.getCurrentLoggedInUser();
        Order order = orderService.getOrderEntityById(id);

        if (currentUser.getRole() != Role.ADMIN && !order.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    // ================= Admin Endpoints =================

    @PutMapping("/{orderId}/status")
public ResponseEntity<OrderResponseDTO> updateOrderStatus(
        @PathVariable Long orderId,
        @RequestBody Map<String, String> statusRequest) {

    User currentUser = orderService.getCurrentLoggedInUser();
    if (currentUser.getRole() != Role.ADMIN) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    String statusStr = statusRequest.get("status");
    OrderStatus status;
    try {
        status = OrderStatus.valueOf(statusStr.toUpperCase());
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().build();
    }

    Order updatedOrder = orderService.updateOrderStatus(orderId, status, currentUser);
    
    // Send email notification to customer
    orderService.sendOrderStatusUpdateEmail(updatedOrder, status);
    
    return ResponseEntity.ok(orderService.getOrderById(updatedOrder.getId()));
}

    @GetMapping("/admin")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersForAdmin() {
        User currentUser = orderService.getCurrentLoggedInUser();
        System.out.println("Current Admin User: " + currentUser);
        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<OrderResponseDTO> orders = orderService.getOrdersForAdmin(currentUser.getEmail());
        return ResponseEntity.ok(orders);
    }
}
