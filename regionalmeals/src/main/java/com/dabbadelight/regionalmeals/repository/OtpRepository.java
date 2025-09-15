package com.dabbadelight.regionalmeals.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dabbadelight.regionalmeals.model.Otp;

public interface OtpRepository extends JpaRepository<Otp, Long> {

    Optional<Otp> findByUser_Id(Long userId);
}
