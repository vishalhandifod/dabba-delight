package com.dabbadelight.regionalmeals.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.dabbadelight.regionalmeals.model.DTO.OrderRequestDTO;
import com.dabbadelight.regionalmeals.model.DTO.OrderResponseDTO;
import com.dabbadelight.regionalmeals.model.Orders.Order;
import com.dabbadelight.regionalmeals.service.OrderService;

@RestController
@RequestMapping("/api/order")
@PreAuthorize("hasRole('USER') or hasAnyRole('ADMIN','SUPERADMIN')")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // ✅ Anyone with USER, ADMIN, SUPERADMIN can place order
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody OrderRequestDTO orderRequest) {
        OrderResponseDTO savedOrder = orderService.createOrder(orderRequest);
        return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);
    }

    // ✅ USER can access only their order, ADMIN/SUPERADMIN can access any
    @GetMapping("{id}")
    @PreAuthorize("hasRole('USER') or hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<OrderResponseDTO> getOrderById(@PathVariable Long id) {
        OrderResponseDTO orderItem = orderService.getOrderById(id);
        return ResponseEntity.ok(orderItem);
    }

    // ✅ Only ADMIN/SUPERADMIN can see all orders
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // ✅ USER can update own order, ADMIN/SUPERADMIN can update any
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody Order order) {
        Order updatedOrder = orderService.updateOrder(id, order);
        return ResponseEntity.ok(updatedOrder);
    }

    // ✅ USER can delete own order, ADMIN/SUPERADMIN can delete any
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ USER can fetch/create their pending order
    @GetMapping("/user/{userId}/pending")
    @PreAuthorize("hasRole('USER') or hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<Order> getOrCreatePendingOrder(@PathVariable Long userId) {
        Order order = orderService.getOrCreatePendingOrderByUserId(userId);
        return ResponseEntity.ok(order);
    }

    // ✅ USER can add items to their order
    @PostMapping("/{orderId}/items")
    @PreAuthorize("hasRole('USER') or hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<Order> addItemToOrder(@PathVariable Long orderId, @RequestBody Map<String, Object> payload) {
        Long itemId = Long.valueOf(payload.get("itemId").toString());
        int quantity = (int) payload.get("quantity");
        Order updatedOrder = orderService.addItemToOrder(orderId, itemId, quantity);
        return ResponseEntity.ok(updatedOrder);
    }

    // ✅ USER can remove items from their order
    @DeleteMapping("/{orderId}/items/{orderItemId}")
    @PreAuthorize("hasRole('USER') or hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<Order> removeItemFromOrder(@PathVariable Long orderId, @PathVariable Long orderItemId) {
        Order updatedOrder = orderService.removeItemFromOrder(orderId, orderItemId);
        return ResponseEntity.ok(updatedOrder);
    }

}
