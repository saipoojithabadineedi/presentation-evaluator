package com.presentation.evaluator.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@presentationevaluator.com}")
    private String fromEmail;

    public boolean sendOtpEmail(String recipientEmail, String otpCode) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        // 1. Write to local development OTP log file for instant zero-friction testing
        try (PrintWriter writer = new PrintWriter(new FileWriter(".local-otps.log", true))) {
            writer.println(String.format("[%s] REAL OTP FOR [%s]: %s (Valid for 5 minutes)", timestamp, recipientEmail, otpCode));
        } catch (Exception e) {
            log.warn("Failed to write to .local-otps.log: {}", e.getMessage());
        }

        // 2. Print prominent banner to backend server terminal console
        System.out.println("\n===============================================================================");
        System.out.println("  📩 [REAL EMAIL DISPATCHER] PRESENTATION EVALUATOR PASSWORD RESET OTP");
        System.out.println("  Timestamp       : " + timestamp);
        System.out.println("  Recipient Email : " + recipientEmail);
        System.out.println("  VERIFICATION OTP: " + otpCode);
        System.out.println("  Validity        : 5 Minutes");
        System.out.println("===============================================================================\n");

        log.info(">>> [OTP DISPATCH] Generated verification OTP [{}] for recipient [{}]", otpCode, recipientEmail);

        // 3. Dispatch real SMTP email via JavaMailSender
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(recipientEmail);
            message.setSubject("Presentation Evaluator - Password Reset OTP");
            
            String content = String.format("""
                Hello,

                We received a request to reset your Presentation Evaluator account password.

                Your verification code is:

                %s

                This code is valid for 5 minutes.

                If you did not request a password reset, you can safely ignore this email.

                Regards,
                Presentation Evaluator Team
                """, otpCode);

            message.setText(content);
            mailSender.send(message);
            log.info("Successfully dispatched SMTP email to {}", recipientEmail);
            return true;
        } catch (Exception e) {
            log.warn("SMTP delivery to {} skipped (configure EMAIL_USER & EMAIL_PASSWORD in .env for external inbox delivery): {}", recipientEmail, e.getMessage());
            return false;
        }
    }
}
