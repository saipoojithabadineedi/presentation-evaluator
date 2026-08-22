package com.presentation.evaluator.controller;

import com.presentation.evaluator.dto.LoginRequest;
import com.presentation.evaluator.dto.RegisterRequest;
import com.presentation.evaluator.entity.UserEntity;
import com.presentation.evaluator.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<UserEntity> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<UserEntity> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        authService.forgotPassword(email);
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Verification code sent to " + email));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("newPassword");
        authService.resetPassword(email, otp, newPassword);
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Password updated successfully"));
    }
}
