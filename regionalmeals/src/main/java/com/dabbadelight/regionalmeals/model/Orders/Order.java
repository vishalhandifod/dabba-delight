package com.dabbadelight.regionalmeals.model.Orders;

import java.util.List;

import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.model.enums.OrderStatus;
import com.dabbadelight.regionalmeals.model.enums.PaymentMode;
import com.dabbadelight.regionalmeals.model.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
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

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference(value = "user-orders")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "order-items")
    private List<OrderItem> orderItems;

    @Column(nullable = false)
    private int totalAmount;

    public void calculateTotalAmount() {
        if (orderItems != null) {
            this.totalAmount = orderItems.stream()
                                        .mapToInt(OrderItem::getTotal)
                                        .sum();
        } else { 
            this.totalAmount = 0;
        }
    }

}
