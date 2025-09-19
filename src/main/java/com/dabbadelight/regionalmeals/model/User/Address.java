package com.dabbadelight.regionalmeals.model.User;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Address Line 1 is required.")
    @Column(nullable = false)
    @Size(max = 100, message = "Address Line 1 be at most 100 characters.")
    private String addressLine1;

    @Size(max = 100, message = "Address Line 2 must be at most 100 characters.")
    @Column(nullable = true)
    private String addressLine2;

    @NotBlank(message = "Landmark is required.")
    @Size(max = 100, message = "Landmark must be at most 100 characters.")
    @Column(nullable = false, length = 100)
    private String landmark;

    @NotBlank(message = "Flat or block is required.")
    @Size(max = 50, message = "Flat/Block must be at most 50 characters.")
    @Column(nullable = false, length = 50)
    private String flatOrBlock;

    @NotBlank(message = "City is required.")
    @Pattern(regexp = "^[A-Za-z\\s]+$", message = "City must contain only letters and spaces.")
    @Size(max = 50, message = "City name must be at most 50 characters.")
    @Column(nullable = false, length = 50)
    private String city;

    @NotBlank(message = "Pincode is required.")
    @Pattern(regexp = "\\d{6}", message = "Pincode must be exactly 6 digits.")
    @Column(nullable = false, length = 6)
    private String pincode;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference(value = "user-address")
    private User user;

}
