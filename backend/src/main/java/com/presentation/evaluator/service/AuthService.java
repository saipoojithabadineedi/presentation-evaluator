package com.presentation.evaluator.service;

import com.presentation.evaluator.dto.LoginRequest;
import com.presentation.evaluator.dto.RegisterRequest;
import com.presentation.evaluator.entity.UserEntity;
import com.presentation.evaluator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public UserEntity login(LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    String generatedName = request.getEmail().contains("@") 
                            ? request.getEmail().split("@")[0] 
                            : "User";
                    UserEntity newUser = UserEntity.builder()
                            .id("usr-" + UUID.randomUUID().toString().substring(0, 8))
                            .email(request.getEmail())
                            .name(generatedName)
                            .tier("Top 5% speaker tier")
                            .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80")
                            .build();
                    return userRepository.save(newUser);
                });
    }

    public UserEntity register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return userRepository.findByEmail(request.getEmail()).orElseThrow();
        }

        UserEntity newUser = UserEntity.builder()
                .id("usr-" + UUID.randomUUID().toString().substring(0, 8))
                .name(request.getName() != null && !request.getName().isBlank() ? request.getName() : "User")
                .email(request.getEmail())
                .password(request.getPassword())
                .tier("Top 5% speaker tier")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80")
                .build();

        return userRepository.save(newUser);
    }
}
