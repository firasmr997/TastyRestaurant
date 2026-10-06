package com.tasty.service;

import com.tasty.config.RateLimitProperties;
import com.tasty.dto.auth.AuthResponse;
import com.tasty.dto.auth.ChangePasswordRequest;
import com.tasty.dto.auth.LoginRequest;
import com.tasty.dto.auth.UserDto;
import com.tasty.entity.User;
import com.tasty.exception.BadRequestException;
import com.tasty.exception.ResourceNotFoundException;
import com.tasty.mapper.UserMapper;
import com.tasty.repository.UserRepository;
import com.tasty.security.AppUserDetails;
import com.tasty.security.CurrentUser;
import com.tasty.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final RateLimiterService rateLimiter;
    private final RateLimitProperties rateLimits;

    public AuthResponse login(LoginRequest request, String clientIp) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String limiterKey = "login:" + clientIp + ":" + email;
        rateLimiter.check(limiterKey, rateLimits.loginAttempts(), rateLimits.loginWindow(),
                "Too many sign-in attempts. Please wait a few minutes and try again.");

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (BadCredentialsException e) {
            log.info("Failed sign-in for {} from {}", email, clientIp);
            throw e;
        }
        rateLimiter.reset(limiterKey);
        AppUserDetails user = (AppUserDetails) authentication.getPrincipal();
        JwtService.IssuedToken token = jwtService.issue(user);
        log.info("Staff sign-in: {}", user.email());
        return new AuthResponse(token.token(), "Bearer", token.expiresAt(), userMapper.toDto(user));
    }

    @Transactional(readOnly = true)
    public UserDto currentUser() {
        return userMapper.toDto(requireCurrentUser());
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = requireCurrentUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Your current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BadRequestException("Choose a password different from the current one");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        log.info("Password changed for {}", user.getEmail());
    }

    private User requireCurrentUser() {
        AppUserDetails principal = CurrentUser.get()
                .orElseThrow(() -> new BadCredentialsException("Not signed in"));
        return userRepository.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Account no longer exists"));
    }
}
