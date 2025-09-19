package com.dabbadelight.regionalmeals.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.model.enums.Role;

public interface UserRepository extends JpaRepository<User, Long> {

    // Find users by role
    List<User> findByRole(Role role);
    
    // Find user by email OR phone
    Optional<User> findByEmailOrPhone(String email, String phone);
    
    // Check if user exists by phone OR email
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.phone = :phone OR u.email = :email")
    boolean existsByPhoneOrEmail(@Param("phone") String phone, @Param("email") String email);
    
    // Additional helpful methods
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}
