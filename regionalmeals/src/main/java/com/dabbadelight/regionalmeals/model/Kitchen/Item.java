package com.dabbadelight.regionalmeals.model.Kitchen;

import java.util.List;

import com.dabbadelight.regionalmeals.model.Orders.OrderItem;
import com.fasterxml.jackson.annotation.JsonBackReference;

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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "item")

public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Item name is required.")
    @Size(max = 100, message = "Item name can have atmost 100 characters.")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Item details is required.")
    @Size(max = 500, message = "Item details can have atmost 500 characters.")
    @Column(nullable = false, length = 500)
    private String details;

    @Column(nullable = false)
    private int price;

    @Column(nullable = false)
    private int stock;

    @Column(nullable = false)
    private boolean isVeg;

    @ManyToOne
    @JoinColumn(name = "menu_id")
    @JsonBackReference(value = "menu-item")
    private Menu menu;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference(value = "item-orderitem")
    private List<OrderItem> orderItem;


}
