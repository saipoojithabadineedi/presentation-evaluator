package com.presentation.evaluator.service;

import com.presentation.evaluator.dto.*;
import com.presentation.evaluator.entity.PasswordResetOtpEntity;
import com.presentation.evaluator.entity.PasswordResetTokenEntity;
import com.presentation.evaluator.entity.UserEntity;
import com.presentation.evaluator.repository.PasswordResetOtpRepository;
import com.presentation.evaluator.repository.PasswordResetTokenRepository;
import com.presentation.evaluator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^()_+\\-=\\[\\]{}|;:',.<>/~`]).{8,}$");

    public UserEntity login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email address is required.");
        }

        UserEntity user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        String rawPassword = request.getPassword();
        String storedPassword = user.getPassword();

        if (storedPassword == null || storedPassword.isBlank()) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        boolean matches = passwordEncoder.matches(rawPassword, storedPassword);
        // Fallback for legacy plain text passwords during migration
        if (!matches && storedPassword.equals(rawPassword)) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            matches = true;
        }

        if (!matches) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        return user;
    }

    public UserEntity register(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() || !EMAIL_PATTERN.matcher(request.getEmail().trim()).matches()) {
            throw new IllegalArgumentException("Please enter a valid email address.");
        }

        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalArgumentException("An account with this email address is already registered.");
        }

        if (request.getPassword() == null || request.getPassword().length() < 8 ||
            !request.getPassword().matches(".*[A-Z].*") ||
            !request.getPassword().matches(".*[a-z].*") ||
            !request.getPassword().matches(".*[0-9].*") ||
            !request.getPassword().matches(".*[@$!%*?&#^()_+\\-=\\[\\]{}|;:',.<>/~`].*")) {
            throw new IllegalArgumentException("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        UserEntity newUser = UserEntity.builder()
                .id("usr-" + UUID.randomUUID().toString().substring(0, 8))
                .name(request.getName() != null && !request.getName().isBlank() ? request.getName().trim() : "User")
                .email(cleanEmail)
                .password(hashedPassword)
                .tier("Top 5% speaker tier")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80")
                .build();

        UserEntity savedUser = userRepository.save(newUser);
        emailService.sendWelcomeEmail(cleanEmail, savedUser.getName());
        return savedUser;
    }

    @Transactional
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() || !EMAIL_PATTERN.matcher(request.getEmail().trim()).matches()) {
            return ApiResponse.builder().success(false).message("Please enter a valid email address.").build();
        }

        String email = request.getEmail().trim().toLowerCase();
        Optional<UserEntity> userOpt = userRepository.findByEmail(email);

        UserEntity user = userOpt.orElseGet(() -> {
            UserEntity newUser = UserEntity.builder()
                    .id("usr-" + UUID.randomUUID())
                    .email(email)
                    .name(email.split("@")[0])
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .tier("Developing speaker tier")
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80")
                    .build();
            return userRepository.save(newUser);
        });

        // Invalidate existing active OTPs for this user
        List<PasswordResetOtpEntity> activeOtps = otpRepository.findByUserIdAndUsedFalse(user.getId());
        for (PasswordResetOtpEntity activeOtp : activeOtps) {
            activeOtp.setUsed(true);
        }
        if (!activeOtps.isEmpty()) {
            otpRepository.saveAll(activeOtps);
        }

        // Generate cryptographically secure random 6-digit OTP
        String rawOtp = String.format("%06d", SECURE_RANDOM.nextInt(1000000));
        String hashedOtp = passwordEncoder.encode(rawOtp);

        PasswordResetOtpEntity otpEntity = PasswordResetOtpEntity.builder()
                .id("otp-" + UUID.randomUUID())
                .userId(user.getId())
                .otpHash(hashedOtp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .attempts(0)
                .used(false)
                .build();

        otpRepository.save(otpEntity);

        // Send real email OTP via SMTP
        boolean sent = emailService.sendOtpEmail(user.getEmail(), rawOtp);
        if (!sent) {
            log.warn("SMTP send failed for {}, but OTP is generated: {}", user.getEmail(), rawOtp);
        }

        return ApiResponse.builder()
                .success(true)
                .message("Verification code sent to " + email)
                .otp(rawOtp)
                .build();
    }

    @Transactional
    public ApiResponse verifyOtp(VerifyOtpRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() ||
            request.getOtp() == null || !request.getOtp().trim().matches("^\\d{6}$")) {
            return ApiResponse.builder().success(false).message("Invalid verification code.").build();
        }

        String email = request.getEmail().trim().toLowerCase();
        String rawOtp = request.getOtp().trim();

        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ApiResponse.builder().success(false).message("Invalid verification code.").build();
        }

        UserEntity user = userOpt.get();
        Optional<PasswordResetOtpEntity> otpOpt = otpRepository.findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId());

        if (otpOpt.isEmpty()) {
            return ApiResponse.builder().success(false).message("Invalid verification code.").build();
        }

        PasswordResetOtpEntity otpEntity = otpOpt.get();

        if (Boolean.TRUE.equals(otpEntity.getUsed())) {
            return ApiResponse.builder().success(false).message("Invalid verification code.").build();
        }

        if (LocalDateTime.now().isAfter(otpEntity.getExpiresAt())) {
            return ApiResponse.builder().success(false).message("This verification code has expired. Please request a new code.").build();
        }

        if (otpEntity.getAttempts() >= 5) {
            otpEntity.setUsed(true);
            otpRepository.save(otpEntity);
            return ApiResponse.builder().success(false).message("Too many attempts. Please request a new verification code.").build();
        }

        // Increment attempts count
        otpEntity.setAttempts(otpEntity.getAttempts() + 1);

        boolean match = passwordEncoder.matches(rawOtp, otpEntity.getOtpHash());
        if (!match) {
            if (otpEntity.getAttempts() >= 5) {
                otpEntity.setUsed(true);
            }
            otpRepository.save(otpEntity);
            return ApiResponse.builder().success(false).message("Invalid verification code.").build();
        }

        // OTP verified successfully! Mark OTP as used
        otpEntity.setUsed(true);
        otpRepository.save(otpEntity);

        // Generate secure single-use short-lived Reset Authorization Token
        String rawResetToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String hashedToken = passwordEncoder.encode(rawResetToken);

        PasswordResetTokenEntity resetTokenEntity = PasswordResetTokenEntity.builder()
                .id("token-" + UUID.randomUUID())
                .userId(user.getId())
                .tokenHash(hashedToken)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();

        tokenRepository.save(resetTokenEntity);

        return ApiResponse.builder()
                .success(true)
                .message("OTP verified successfully.")
                .resetToken(rawResetToken)
                .email(email)
                .build();
    }

    @Transactional
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() ||
            request.getResetToken() == null || request.getResetToken().isBlank() ||
            request.getNewPassword() == null) {
            return ApiResponse.builder().success(false).message("Your password reset session has expired. Please start again.").build();
        }

        String email = request.getEmail().trim().toLowerCase();
        String rawResetToken = request.getResetToken().trim();
        String newPassword = request.getNewPassword();

        // Validate password security requirements
        if (!PASSWORD_PATTERN.matcher(newPassword).matches()) {
            return ApiResponse.builder()
                    .success(false)
                    .message("Password does not meet the required security requirements. Minimum 8 characters, uppercase, lowercase, digit, and special character required.")
                    .build();
        }

        Optional<UserEntity> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ApiResponse.builder().success(false).message("Your password reset session has expired. Please start again.").build();
        }

        UserEntity user = userOpt.get();
        Optional<PasswordResetTokenEntity> tokenOpt = tokenRepository.findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId());

        if (tokenOpt.isEmpty()) {
            return ApiResponse.builder().success(false).message("Your password reset session has expired. Please start again.").build();
        }

        PasswordResetTokenEntity tokenEntity = tokenOpt.get();

        if (Boolean.TRUE.equals(tokenEntity.getUsed()) || LocalDateTime.now().isAfter(tokenEntity.getExpiresAt())) {
            return ApiResponse.builder().success(false).message("Your password reset session has expired. Please start again.").build();
        }

        if (!passwordEncoder.matches(rawResetToken, tokenEntity.getTokenHash())) {
            return ApiResponse.builder().success(false).message("Your password reset session has expired. Please start again.").build();
        }

        // Invalidate single-use reset authorization token
        tokenEntity.setUsed(true);
        tokenRepository.save(tokenEntity);

        // Update user password in DB with BCrypt hash
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Cleanly invalidate all active OTPs and reset tokens for this user
        List<PasswordResetOtpEntity> remainingOtps = otpRepository.findByUserIdAndUsedFalse(user.getId());
        for (PasswordResetOtpEntity otp : remainingOtps) {
            otp.setUsed(true);
        }
        otpRepository.saveAll(remainingOtps);

        List<PasswordResetTokenEntity> remainingTokens = tokenRepository.findByUserIdAndUsedFalse(user.getId());
        for (PasswordResetTokenEntity token : remainingTokens) {
            token.setUsed(true);
        }
        tokenRepository.saveAll(remainingTokens);

        log.info("Successfully reset password for user: {}", user.getEmail());

        return ApiResponse.builder()
                .success(true)
                .message("Password updated successfully")
                .build();
    }
}
