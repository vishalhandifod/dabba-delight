package com.dabbadelight.regionalmeals.config;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

import com.dabbadelight.regionalmeals.model.Otp;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.repository.OtpRepository;
import com.dabbadelight.regionalmeals.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class OtpAuthenticationProvider implements AuthenticationProvider {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;

    public OtpAuthenticationProvider(UserRepository userRepository, OtpRepository otpRepository) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String usernameOrPhone = authentication.getName(); // could be email or phone
        String otp = (String) authentication.getCredentials();

        System.out.println("🔐 OtpAuthenticationProvider: Authenticating user: " + usernameOrPhone);
        System.out.println("🔐 OtpAuthenticationProvider: OTP: " + otp);

        try {
            // Find user by email OR phone
            User user = userRepository.findByEmailOrPhone(usernameOrPhone, usernameOrPhone)
                    .orElseThrow(() -> new BadCredentialsException("User not found for: " + usernameOrPhone));

            System.out.println("🔐 Found user: " + user.getEmail() + " (ID: " + user.getId() + ")");

            // Find valid OTP for user that hasn't expired
            Optional<Otp> userOtpOptional = otpRepository.findByUserAndExpiresAtAfter(user, LocalDateTime.now());
            
            if (userOtpOptional.isEmpty()) {
                System.out.println("❌ No valid OTP found for user: " + user.getEmail());
                throw new BadCredentialsException("No valid OTP found for user");
            }

            Otp userOtp = userOtpOptional.get();
            System.out.println("🔐 Found OTP: " + userOtp.getOtp() + " (expires: " + userOtp.getExpiresAt() + ")");

            if (!userOtp.getOtp().equals(otp)) {
                System.out.println("❌ OTP mismatch - Expected: " + userOtp.getOtp() + ", Got: " + otp);
                throw new BadCredentialsException("Invalid OTP");
            }

            System.out.println("✅ OTP validation successful, cleaning up OTP");
            
            // Cleanup OTP after successful validation
            otpRepository.delete(userOtp);

            // Return authenticated user
            return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            
        } catch (BadCredentialsException e) {
            System.out.println("❌ Authentication failed: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.out.println("❌ Unexpected error during authentication: " + e.getMessage());
            e.printStackTrace();
            throw new BadCredentialsException("Authentication failed due to internal error");
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}