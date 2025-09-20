package com.dabbadelight.regionalmeals.model.User;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "address")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Address Line 1 is required.")
    @Size(max = 100, message = "Address Line 1 must be at most 100 characters.")
    @Column(nullable = false, length = 100)
    private String addressLine1;

    @Size(max = 100, message = "Address Line 2 must be at most 100 characters.")
    @Column(length = 100)
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
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference(value = "user-address")
    private User user;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
