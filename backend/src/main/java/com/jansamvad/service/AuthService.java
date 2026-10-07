package com.jansamvad.service;

import com.jansamvad.dto.AuthResponse;
import com.jansamvad.dto.SignUpRequest;
import com.jansamvad.dto.UserResponse;
import com.jansamvad.entity.UserEntity;
import com.jansamvad.repository.UserRepository;
import com.jansamvad.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse signUp(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new IllegalArgumentException("An account with this mobile number already exists");
        }

        UserEntity user = new UserEntity();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setMobileNumber(request.getMobileNumber());
        user.setRole(UserEntity.Role.CITIZEN);
        user.setWard(request.getWard());

        UserEntity saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getId(), saved.getEmail(), saved.getRole().name());
        return new AuthResponse(
                token,
                String.valueOf(saved.getId()),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole().name(),
                saved.getWard(),
                saved.getDepartment(),
                saved.getMobileNumber()
        );
    }

    public AuthResponse signIn(String email, String password) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(
                token,
                String.valueOf(user.getId()),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getWard(),
                user.getDepartment(),
                user.getMobileNumber()
        );
    }

    public UserResponse getCurrentUser(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getMobileNumber(),
                user.getRole().name(),
                user.getWard(),
                user.getDepartment(),
                user.getCreatedAt()
        );
    }
}
