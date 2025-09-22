package com.dabbadelight.regionalmeals.model.Orders;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.dabbadelight.regionalmeals.model.Kitchen.Menu;
import com.dabbadelight.regionalmeals.model.User.Address;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.model.enums.OrderStatus;
import com.dabbadelight.regionalmeals.model.enums.PaymentMode;
import com.dabbadelight.regionalmeals.model.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import lombok.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Payment mode cannot be null.")
    @Column(nullable = false)
    private PaymentMode paymentMode;
    
    @NotNull(message = "Payment Status cannot be null.")
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    @NotNull(message = "Order Status cannot be null.")
    @Column(nullable = false)
    private OrderStatus orderStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    @JsonBackReference(value = "admin-orders")
    private Menu admin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference(value = "user-orders")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference(value = "order-items")
    private List<OrderItem> orderItems = new ArrayList<>();

    @Column(nullable = false)
    private double totalAmount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name="address_id", nullable = false)
    private Address address;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
        public Menu getAdmin() { return admin; }
    public void setAdmin(Menu admin) { this.admin = admin; }
    public void calculateTotalAmount() {
        if (orderItems != null && !orderItems.isEmpty()) {
            this.totalAmount = orderItems.stream()
                                         .mapToDouble(OrderItem::getTotal)
                                         .sum();
        } else {
            this.totalAmount = 0;
        }
    }
}
