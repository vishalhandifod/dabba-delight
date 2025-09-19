package com.dabbadelight.regionalmeals.model.Orders;

import com.dabbadelight.regionalmeals.model.Kitchen.Item;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "order_item")

public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference(value = "order-items")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    @JsonBackReference(value = "item-orderitem")
    private Item item;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private double priceAtPurchase;

    public double getTotal() {
        return quantity * priceAtPurchase;
    }

}
