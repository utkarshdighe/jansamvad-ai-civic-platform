package com.jansamvad.security;

import com.jansamvad.entity.UserEntity;
import com.jansamvad.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private final UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserEntity getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserDetails)) {
            throw new IllegalStateException("No authenticated user found");
        }
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database: " + email));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserDetails)) {
            throw new IllegalStateException("No authenticated user found");
        }
        return ((UserDetails) auth.getPrincipal()).getUsername();
    }

    public boolean hasRole(UserEntity.Role role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role.name()));
    }
}
