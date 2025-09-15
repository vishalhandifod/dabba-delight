package com.dabbadelight.regionalmeals.service.impl;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.repository.UserRepository;
import com.dabbadelight.regionalmeals.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(User user, Long id) {
        User existingUser = getUserById(id);
        existingUser.setName(user.getName());
        existingUser.setPhone(user.getPhone());
        existingUser.setEmail(user.getEmail());
        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public boolean checkUser(String phone, String email) {
        return userRepository.existsByPhoneOrEmail(phone, email);
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return (UserDetails) userRepository.findByEmailOrPhone(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
    
}

