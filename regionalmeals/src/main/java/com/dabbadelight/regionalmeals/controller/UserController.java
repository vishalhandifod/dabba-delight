package com.dabbadelight.regionalmeals.controller;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.service.UserService;
import com.dabbadelight.regionalmeals.model.enums.Role;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    // Create new User - Public endpoint (registration)
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody User user) {
        try {
            // Validate email and phone
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is required"));
            }

            if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Phone number is required"));
            }
            
            // Check if user already exists
            if (userService.checkUser(user.getPhone(), user.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "User with this email or phone already exists"));
            }

            // Encode password
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Password is required"));
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            // Assign default role if not provided
            if (user.getRole() == null) {
                user.setRole(Role.USER);
            }

            // Save user
            User savedUser = userService.createUser(user);

            // Prepare response (hide password)
            Map<String, Object> response = Map.of(
                    "id", savedUser.getId(),
                    "name", savedUser.getName(),
                    "email", savedUser.getEmail(),
                    "phone", savedUser.getPhone(),
                    "role", savedUser.getRole(),
                    "message", "User registered successfully"
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            System.err.println("=== ERROR DETAILS ===");
            System.err.println("Error Type: " + e.getClass().getName());
            System.err.println("Error Message: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("Cause: " + e.getCause().getMessage());
            }
            e.printStackTrace();
            System.err.println("====================");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Something went wrong: " + e.getMessage()));
        }
    }

    // Create SUPERADMIN - Remove security check for testing
    @PostMapping("/create-superadmin")
    public ResponseEntity<Map<String, Object>> createSuperAdmin(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");
        String phone = payload.get("phone");
        String password = payload.get("password");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Email is required"));
        }

        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Password is required"));
        }

        // Provide default phone if not provided
        if (phone == null || phone.trim().isEmpty()) {
            phone = "0000000000";
        }

        // Check if user already exists with this email
        if (userService.checkUser(phone, email)) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "User with this email or phone already exists"));
        }

        // Create SUPERADMIN user
        User superAdmin = new User();
        superAdmin.setEmail(email);
        superAdmin.setName(name != null ? name : "Super Admin");
        superAdmin.setPassword(passwordEncoder.encode(password));
        superAdmin.setPhone(phone);
        superAdmin.setRole(Role.SUPERADMIN);

        User savedUser = userService.createUser(superAdmin);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "SUPERADMIN created successfully");
        response.put("id", savedUser.getId());
        response.put("email", savedUser.getEmail());
        response.put("name", savedUser.getName());
        response.put("role", savedUser.getRole());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Debug endpoint to check authentication
    @GetMapping("/debug-auth")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> debugAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        System.out.println("=== AUTH DEBUG ===");
        System.out.println("Principal: " + auth.getPrincipal().getClass().getSimpleName());
        System.out.println("Name: " + auth.getName());
        System.out.println("Authorities: " + auth.getAuthorities());
        System.out.println("Authenticated: " + auth.isAuthenticated());
        System.out.println("==================");
        
        return ResponseEntity.ok(Map.of(
            "name", auth.getName(),
            "authorities", auth.getAuthorities(),
            "principal", auth.getPrincipal().getClass().getSimpleName(),
            "authenticated", auth.isAuthenticated()
        ));
    }

    // Get current authenticated user's profile
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = (User) userService.loadUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    // Get User by ID - Requires authentication
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // Get all users - SUPERADMIN only
    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<User>> getAllUsers() {
        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        // System.out.println("=== ACCESSING /all ENDPOINT ===");
        // System.out.println("User: " + auth.getName());
        // System.out.println("Authorities: " + auth.getAuthorities());
        // System.out.println("Has ROLE_SUPERADMIN: " + auth.getAuthorities().stream()
        //     .anyMatch(a -> a.getAuthority().equals("ROLE_SUPERADMIN")));
        // System.out.println("===============================");
        
        List<User> users = userService.getAllUsers();
        
        // Remove passwords from response for security
        // users.forEach(user -> user.setPassword(null));
        
        return ResponseEntity.ok(users);
    }
    
    // Update current user's profile
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> updateCurrentUserProfile(@Valid @RequestBody User user) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        Long currentUserId = currentUser.getId();
        
        User updatedUser = userService.updateUser(user, currentUserId);
        return ResponseEntity.ok(updatedUser);
    }
    
    // Update user by ID - Admin only or own profile
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (#id == authentication.principal.id)")
    public ResponseEntity<User> updateUser(@Valid @PathVariable Long id, @RequestBody User user) {
        User updatedUser = userService.updateUser(user, id);
        return ResponseEntity.ok(updatedUser);
    }

    // Delete User - Admin only or own profile
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (#id == authentication.principal.id)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Check if user exists - Public endpoint
    @PostMapping("/check-user")
    public ResponseEntity<Map<String, Boolean>> checkUser(@RequestBody Map<String, String> payload) {
        boolean exists = userService.checkUser(payload.get("phone"), payload.get("email"));
        return ResponseEntity.ok(Map.of("exists", exists));
    }
    
    // Get authenticated user info
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "phone", user.getPhone(),
            "name", user.getName(),
            "role", user.getRole().name(),
            "roles", user.getAuthorities()
        ));
    }

    // Helper method to generate random password
    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }
}