package com.dabbadelight.regionalmeals.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.dabbadelight.regionalmeals.model.Otp;
import com.dabbadelight.regionalmeals.model.User.User;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    
    // Find the most recent valid OTP for a user that hasn't expired
    @Query("SELECT o FROM Otp o WHERE o.user = :user AND o.expiresAt > :currentTime ORDER BY o.expiresAt DESC")
    Optional<Otp> findByUserAndExpiresAtAfter(@Param("user") User user, @Param("currentTime") LocalDateTime currentTime);
    
    // Find OTP by user ID
    @Query("SELECT o FROM Otp o WHERE o.user.id = :userId")
    Optional<Otp> findByUserId(@Param("userId") Long userId);
    
    // Find all OTPs for a user (useful for debugging)
    Optional<Otp> findByUser(User user);
    
    // Delete all OTPs for a specific user
    @Modifying
    @Transactional
    @Query("DELETE FROM Otp o WHERE o.user = :user")
    void deleteByUser(@Param("user") User user);
    
    // Delete all expired OTPs (for cleanup)
    @Modifying
    @Transactional
    @Query("DELETE FROM Otp o WHERE o.expiresAt < :currentTime")
    void deleteByExpiresAtBefore(@Param("currentTime") LocalDateTime currentTime);
    
    // Check if user has any valid OTPs
    @Query("SELECT COUNT(o) FROM Otp o WHERE o.user = :user AND o.expiresAt > :currentTime")
    long countValidOtpsByUser(@Param("user") User user, @Param("currentTime") LocalDateTime currentTime);
}