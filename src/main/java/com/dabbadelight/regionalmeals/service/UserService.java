package com.dabbadelight.regionalmeals.service;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;

import com.dabbadelight.regionalmeals.model.User.User;
import com.dabbadelight.regionalmeals.model.enums.Role;

public interface UserService {

    User createUser(User user);

    User getUserById(Long id);

     List<User> getUsersByRole(Role role);

    List<User> getAllUsers();

    User updateUser(User user, Long id);

    void deleteUser(Long id);

    boolean checkUser(String phone, String email);

    UserDetails loadUserByUsername(String username);
    
}

