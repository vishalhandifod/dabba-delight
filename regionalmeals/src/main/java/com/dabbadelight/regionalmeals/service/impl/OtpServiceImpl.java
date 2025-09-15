package com.dabbadelight.regionalmeals.service.impl;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.stereotype.Service;

import com.dabbadelight.regionalmeals.model.Otp;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.repository.OtpRepository;
import com.dabbadelight.regionalmeals.service.OtpService;

@Service
public class OtpServiceImpl implements OtpService {

    private final OtpRepository otpRepository;

    public OtpServiceImpl(OtpRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    @Override
    public String generateOtp(User user) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        Otp otpEntity = new Otp();
        otpEntity.setOtp(otp);
        otpEntity.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpEntity.setUser(user);
        otpRepository.save(otpEntity);
        System.out.println("Generated OTP: " + otp);
        return otp;
    }

    @Override
    public boolean validateOtp(User user, String otp) {
        Optional<Otp> otpOptional = otpRepository.findByUser_Id(user.getId());
        if (otpOptional.isPresent()) {
            Otp otpEntity = otpOptional.get();
            if (otpEntity.getOtp().equals(otp) && otpEntity.getExpiresAt().isAfter(LocalDateTime.now())) {
                return true; // ✅ Don't delete here
            }
        }
        return false;
    }

}
