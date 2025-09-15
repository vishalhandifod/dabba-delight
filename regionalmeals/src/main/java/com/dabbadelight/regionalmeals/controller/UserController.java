package com.dabbadelight.regionalmeals.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.service.UserService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    //Create new User
    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        User savedUser = userService.createUser(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    //Get User by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    //Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    //Update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@Valid @PathVariable Long id, @RequestBody User user) {
        User updatedUser = userService.updateUser(user, id);
        return ResponseEntity.ok(updatedUser);
    }

    //Delete User
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    //Check if user exists
    @PostMapping("/check-user")
    public ResponseEntity<Map<String, Boolean>> checkUser(@RequestBody Map<String, String> payload) {
        boolean exists = userService.checkUser(payload.get("phone"), payload.get("email"));
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    //Get User by email
    @GetMapping("/by-email")
    public ResponseEntity<User> getUserByEmail(@RequestParam String email) {
        User user = (User) userService.loadUserByUsername(email);
        return ResponseEntity.ok(user);
    }
    
}
