package com.dabbadelight.regionalmeals.model.Kitchen;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "kitchen_address")
@NoArgsConstructor
@AllArgsConstructor
public class KitchenAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Address Line 1 is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String addressLine1;

    @Size(max = 100)
    @Column(length = 100)
    private String addressLine2;

    @NotBlank(message = "Landmark is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String landmark;

    @NotBlank(message = "City is required")
    @Pattern(regexp = "^[A-Za-z\\s]+$", message = "City must contain only letters and spaces")
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String city;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "\\d{6}", message = "Pincode must be a 6-digit number")
    @Column(nullable = false, length = 6)
    private String pincode;

    @ManyToOne
    @JoinColumn(name = "menu_id")
    @JsonBackReference(value = "menu-address")
    private Menu menu;
}
