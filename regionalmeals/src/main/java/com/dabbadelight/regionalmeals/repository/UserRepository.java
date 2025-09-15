package com.dabbadelight.regionalmeals.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dabbadelight.regionalmeals.model.User.User;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByPhoneOrEmail(String phone, String email);

    Optional<User> findByEmailOrPhone(String email, String phone);

}

