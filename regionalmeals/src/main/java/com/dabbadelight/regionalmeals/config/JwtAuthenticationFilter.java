package com.dabbadelight.regionalmeals.config;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.dabbadelight.regionalmeals.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private static final String JWT_COOKIE_NAME = "JWT_TOKEN";

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Skip authentication for public endpoints as per your app design
        if (isPublicEndpoint(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Optional<String> jwtTokenOpt = extractJwtFromCookie(request);

            if (jwtTokenOpt.isPresent() && SecurityContextHolder.getContext().getAuthentication() == null) {
                String token = jwtTokenOpt.get();

                try {
                    // Extract username and claims from the JWT token
                    String username = jwtService.extractUsername(token);
                    Claims claims = jwtService.extractAllClaims(token);

                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        // Load user details from DB or cache, optional depending on your auth flow
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                        // Validate token against user details
                        if (jwtService.isTokenValid(token, userDetails)) {

                            // Retrieve roles from token claims, assuming roles stored as comma-separated string or list
                            // Adjust extraction logic if your JWT stores role differently
                            Object roleClaim = claims.get("role");
                            List<SimpleGrantedAuthority> authorities;

                            if (roleClaim instanceof String) {
                                // Single role as string e.g. "SUPERADMIN"
                                authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleClaim));
                            } else if (roleClaim instanceof List<?>) {
                                // Multiple roles as list of strings
                                @SuppressWarnings("unchecked")
                                List<String> roles = (List<String>) roleClaim;
                                authorities = roles.stream()
                                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                                        .collect(Collectors.toList());
                            } else {
                                // Fallback - use authorities from UserDetails
                                authorities = userDetails.getAuthorities().stream()
                                        .map(grantedAuthority -> new SimpleGrantedAuthority(grantedAuthority.getAuthority()))
                                        .collect(Collectors.toList());
                            }

                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                            SecurityContextHolder.getContext().setAuthentication(authToken);
                            System.out.println("✅ JWT authentication successful for user: " + username + " with roles: " + authorities);
                        }
                    }
                } catch (ExpiredJwtException expiredJwtException) {
                    System.out.println("❌ JWT token has expired: " + expiredJwtException.getMessage());
                    handleExpiredJwt(response);
                    return;
                } catch (MalformedJwtException malformedJwtException) {
                    System.out.println("❌ JWT token is malformed: " + malformedJwtException.getMessage());
                    handleInvalidJwt(response);
                    return;
                } catch (UnsupportedJwtException unsupportedJwtException) {
                    System.out.println("❌ JWT token is unsupported: " + unsupportedJwtException.getMessage());
                    handleInvalidJwt(response);
                    return;
                } catch (JwtException jwtException) {
                    System.out.println("❌ JWT processing error: " + jwtException.getMessage());
                    handleInvalidJwt(response);
                    return;
                }
            }
        } catch (Exception e) {
            System.out.println("❌ JWT authentication failed: " + e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private Optional<String> extractJwtFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }

        return Arrays.stream(request.getCookies())
                .filter(cookie -> JWT_COOKIE_NAME.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.trim().isEmpty())
                .findFirst();
    }

    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/auth/")
                || path.equals("/api/users")
                || path.startsWith("/api/users/check-user");
    }

    private void handleExpiredJwt(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");

        clearJwtCookie(response);

        ObjectMapper mapper = new ObjectMapper();
        String jsonResponse = mapper.writeValueAsString(new JwtErrorResponse(
                "JWT_EXPIRED",
                "Your session has expired. Please log in again.",
                HttpStatus.UNAUTHORIZED.value()
        ));

        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }

    private void handleInvalidJwt(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");

        clearJwtCookie(response);

        ObjectMapper mapper = new ObjectMapper();
        String jsonResponse = mapper.writeValueAsString(new JwtErrorResponse(
                "JWT_INVALID",
                "Invalid authentication token. Please log in again.",
                HttpStatus.UNAUTHORIZED.value()
        ));

        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie clearCookie = new Cookie(JWT_COOKIE_NAME, "");
        clearCookie.setHttpOnly(true);
        clearCookie.setPath("/");
        clearCookie.setMaxAge(0); // Expire immediately
        response.addCookie(clearCookie);
    }

    // Response class for JWT errors
    public static class JwtErrorResponse {
        private String error;
        private String message;
        private int status;
        private long timestamp;

        public JwtErrorResponse(String error, String message, int status) {
            this.error = error;
            this.message = message;
            this.status = status;
            this.timestamp = System.currentTimeMillis();
        }

        public String getError() { return error; }
        public String getMessage() { return message; }
        public int getStatus() { return status; }
        public long getTimestamp() { return timestamp; }
    }
}
