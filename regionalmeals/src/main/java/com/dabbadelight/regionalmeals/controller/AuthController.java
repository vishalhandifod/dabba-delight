package com.dabbadelight.regionalmeals.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.service.JwtService;
import com.dabbadelight.regionalmeals.service.OtpService;
import com.dabbadelight.regionalmeals.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService,
                          OtpService otpService,
                          JwtService jwtService,
                          AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.otpService = otpService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/request-otp")
    public ResponseEntity<String> requestOtp(@RequestBody AuthRequest request) {
        User user = (User) userService.loadUserByUsername(request.getUsername());
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }
        otpService.generateOtp(user); // in a real app, you'd send via SMS/email
        return ResponseEntity.ok("OTP sent");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody OtpVerificationRequest request) {
        System.out.println("📩 Incoming OTP verification request for user: " + request.getUsername());
        User user = (User) userService.loadUserByUsername(request.getUsername());
        if (user == null) {
            System.out.println("❌ User not found: " + request.getUsername());
            return ResponseEntity.status(404).body("User not found");
        }

        boolean valid = otpService.validateOtp(user, request.getOtp());
        System.out.println("🔍 OTP validation result for user " + user.getEmail() + ": " + valid);

        if (valid) {
            try {
                Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getOtp())
                );
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                String jwt = jwtService.generateToken(userDetails);

                System.out.println("✅ OTP verified successfully for user: " + user.getEmail());
                System.out.println("🔑 Generated JWT: " + jwt);

                return ResponseEntity.ok(jwt);
            } catch (Exception e) {
                System.out.println("❌ AuthenticationManager failed: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(403).body("Authentication failed");
            }
        }

        System.out.println("❌ Invalid OTP entered for user: " + user.getEmail());
        return ResponseEntity.status(400).body("Invalid OTP");
    }


}

// DTOs
class AuthRequest {
    private String username;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}

class OtpVerificationRequest {
    private String username;
    private String otp;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
