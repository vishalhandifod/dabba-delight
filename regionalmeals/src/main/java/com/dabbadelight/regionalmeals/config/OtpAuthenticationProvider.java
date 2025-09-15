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

        // ✅ find user by email OR phone
        User user = userRepository.findByEmailOrPhone(usernameOrPhone, usernameOrPhone)
                .orElseThrow(() -> new BadCredentialsException("User not found for: " + usernameOrPhone));

        // ✅ check OTP for user
        Otp userOtp = otpRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new BadCredentialsException("No OTP found for user"));

        if (!userOtp.getOtp().equals(otp)) {
            throw new BadCredentialsException("Invalid username or otp");
        }

        // ✅ cleanup OTP after success
        otpRepository.delete(userOtp);

        // ✅ return authenticated user
        return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
