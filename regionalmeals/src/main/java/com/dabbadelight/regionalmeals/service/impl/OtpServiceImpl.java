package com.dabbadelight.regionalmeals.service.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dabbadelight.regionalmeals.model.Otp;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.repository.OtpRepository;
import com.dabbadelight.regionalmeals.service.OtpService;

@Service
@Transactional
public class OtpServiceImpl implements OtpService {
    
    private final OtpRepository otpRepository;
    private static final int OTP_EXPIRY_MINUTES = 5; // OTP expires in 5 minutes
    private static final int OTP_LENGTH = 6;

    public OtpServiceImpl(OtpRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

    @Override
    public String generateOtp(User user) {
        // Clear any existing OTPs for this user first
        clearExistingOtps(user);
        
        // Generate 6-digit OTP
        String otpValue = generateRandomOtp();
        
        // Create OTP entity with expiry time
        Otp otp = new Otp();
        otp.setOtp(otpValue);
        otp.setUser(user);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        
        // Save to database
        otpRepository.save(otp);
        
        System.out.println("Generated OTP: " + otpValue + " for user: " + user.getEmail() + 
                          " (expires at: " + otp.getExpiresAt() + ")");
        
        return otpValue;
    }

    @Override
    public boolean validateOtp(User user, String submittedOtp) {
        try {
            System.out.println("🔍 Validating OTP for user: " + user.getEmail());
            System.out.println("🔍 Submitted OTP: '" + submittedOtp + "'");
            
            // Find the most recent valid OTP for this user
            Optional<Otp> otpOptional = otpRepository.findByUserAndExpiresAtAfter(
                user, LocalDateTime.now()
            );
            
            if (otpOptional.isEmpty()) {
                System.out.println("❌ No valid OTP found or OTP expired for user: " + user.getEmail());
                return false;
            }
            
            Otp storedOtp = otpOptional.get();
            System.out.println("🔍 Stored OTP: '" + storedOtp.getOtp() + "'");
            System.out.println("🔍 OTP expires at: " + storedOtp.getExpiresAt());
            System.out.println("🔍 Current time: " + LocalDateTime.now());
            
            // Check if OTP matches
            boolean otpMatches = storedOtp.getOtp().equals(submittedOtp);
            System.out.println("🔍 OTP matches: " + otpMatches);
            
            if (otpMatches) {
                // OTP is valid, delete it to prevent reuse
                otpRepository.delete(storedOtp);
                System.out.println("✅ OTP validated and deleted for user: " + user.getEmail());
                return true;
            } else {
                System.out.println("❌ OTP mismatch for user: " + user.getEmail());
                return false;
            }
            
        } catch (Exception e) {
            System.out.println("❌ Error validating OTP: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void clearExistingOtps(User user) {
        try {
            // Delete all existing OTPs for this user
            otpRepository.deleteByUser(user);
            System.out.println("🗑️ Cleared existing OTPs for user: " + user.getEmail());
        } catch (Exception e) {
            System.out.println("❌ Error clearing existing OTPs: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    @Transactional
    public void cleanupExpiredOtps() {
        try {
            // Delete all expired OTPs
            otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
            System.out.println("🧹 Cleaned up expired OTPs");
        } catch (Exception e) {
            System.out.println("❌ Error cleaning up expired OTPs: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String generateRandomOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        
        return otp.toString();
    }
}