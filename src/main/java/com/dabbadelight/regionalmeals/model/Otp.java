package com.dabbadelight.regionalmeals.model;

import java.time.LocalDateTime;

import com.dabbadelight.regionalmeals.model.User.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "otp")
public class Otp {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "otp", nullable = false, length = 10)
    private String otp;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Constructors
    public Otp() {}
    
    public Otp(String otp, LocalDateTime expiresAt, User user) {
        this.otp = otp;
        this.expiresAt = expiresAt;
        this.user = user;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getOtp() {
        return otp;
    }
    
    public void setOtp(String otp) {
        this.otp = otp;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    // Helper methods
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }
    
    @Override
    public String toString() {
        return "Otp{" +
                "id=" + id +
                ", otp='" + otp + '\'' +
                ", expiresAt=" + expiresAt +
                ", userId=" + (user != null ? user.getId() : null) +
                '}';
    }
}