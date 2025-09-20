package com.dabbadelight.regionalmeals.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.service.JwtService;
import com.dabbadelight.regionalmeals.service.OtpService;
import com.dabbadelight.regionalmeals.service.UserService;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final OtpService otpService;
    private final JwtService jwtService;

    // Cookie configuration
    private static final String JWT_COOKIE_NAME = "JWT_TOKEN";
    private static final int COOKIE_EXPIRY = 24 * 60 * 60; // 24 hours in seconds

    public AuthController(UserService userService,
                          OtpService otpService,
                          JwtService jwtService) {
        this.userService = userService;
        this.otpService = otpService;
        this.jwtService = jwtService;
    }

    @PostMapping("/request-otp")
    public ResponseEntity<String> requestOtp(@RequestBody AuthRequest request) {
        try {
            System.out.println("📩 OTP request for user: " + request.getUsername());
            
            User user = (User) userService.loadUserByUsername(request.getUsername());
            if (user == null) {
                System.out.println("❌ User not found: " + request.getUsername());
                return ResponseEntity.status(404).body("User not found");
            }
            
            // Clear any existing OTPs for this user before generating new one
            otpService.clearExistingOtps(user);
            
            // Generate new OTP
            String generatedOtp = otpService.generateOtp(user);
            System.out.println("✅ OTP generated successfully: " + generatedOtp + " for user: " + user.getEmail());
            
            // In production, send OTP via SMS/Email service
            // For now, just log it (remove this in production)
            
            return ResponseEntity.ok("OTP sent successfully");
            
        } catch (Exception e) {
            System.out.println("❌ Error generating OTP: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error sending OTP");
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody OtpVerificationRequest request, 
                                          HttpServletResponse response) {
        try {
            System.out.println("📩 Incoming OTP verification request for user: " + request.getUsername());
            
            User user = (User) userService.loadUserByUsername(request.getUsername());
            System.out.println("user details: " + user);
            if (user == null) {
                System.out.println("❌ User not found: " + request.getUsername());
                return ResponseEntity.status(404).body("User not found");
            }

            System.out.println("🔍 User ID: " + user.getId());
            System.out.println("🔍 Submitted OTP: '" + request.getOtp() + "'");
            System.out.println("🔍 OTP length: " + request.getOtp().length());
            
            // Validate OTP
            boolean valid = otpService.validateOtp(user, request.getOtp());
            System.out.println("🔍 OTP validation result for user " + user.getEmail() + ": " + valid);

            if (valid) {
                // Generate JWT token directly without AuthenticationManager
                String jwt = jwtService.generateToken(user);
                System.out.println("✅ OTP verified successfully for user: " + user.getEmail());
                System.out.println("🔑 Generated JWT: " + jwt);

                // Create secure HTTP-only cookie
                ResponseCookie jwtCookie = ResponseCookie.from(JWT_COOKIE_NAME, jwt)
                        .httpOnly(true)           // Prevents XSS attacks
                        .secure(false)           // Set to true in production with HTTPS
                        .path("/")               // Cookie available for entire application
                        .maxAge(COOKIE_EXPIRY)   // Cookie expiry time
                        .sameSite("Lax")         // Changed from Strict to Lax for better compatibility
                        .build();

                // Also return JWT in response body for frontend usage
                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                        .body(jwt); // Return JWT token in response body
            }

            System.out.println("❌ Invalid OTP entered for user: " + user.getEmail());
            return ResponseEntity.status(400).body("Invalid OTP");
            
        } catch (Exception e) {
            System.out.println("❌ Error verifying OTP: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error verifying OTP");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        try {
            // Clear the JWT cookie by setting it to expire immediately
            ResponseCookie jwtCookie = ResponseCookie.from(JWT_COOKIE_NAME, "")
                    .httpOnly(true)
                    .secure(false)  // Set to true in production with HTTPS
                    .path("/")
                    .maxAge(0)  // Expire immediately
                    .sameSite("Lax")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                    .body("Logged out successfully");
                    
        } catch (Exception e) {
            System.out.println("❌ Error during logout: " + e.getMessage());
            return ResponseEntity.status(500).body("Error during logout");
        }
    }
}

// DTOs
class AuthRequest {
    private String username;

    public String  getUsername() { return username; }
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