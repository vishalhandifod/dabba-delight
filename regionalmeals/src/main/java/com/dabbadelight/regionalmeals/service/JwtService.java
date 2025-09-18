package com.dabbadelight.regionalmeals.service;
import io.jsonwebtoken.Claims;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {

    String extractUsername(String token);

    String generateToken(UserDetails userDetails);

    Claims extractAllClaims(String token);

    boolean isTokenValid(String token, UserDetails userDetails);
}
