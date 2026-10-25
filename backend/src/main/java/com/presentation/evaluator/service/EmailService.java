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

    @Value("${spring.mail.username:thupakulakulayappa24@gmail.com}")
    private String fromEmail;

    @Value("${resend.api-key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    public boolean sendOtpEmail(String recipientEmail, String otpCode) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        // 1. Write to local development OTP log file for instant testing reference
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

        // 3. Dispatch email asynchronously (HTTPS API first to bypass cloud SMTP firewall blocks, then SMTP fallback)
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            // Attempt HTTPS delivery via Resend API (Port 443 - Never blocked by Render/Cloud firewalls)
            if (resendApiKey != null && !resendApiKey.isBlank()) {
                try {
                    System.out.println(">>> [RESEND DISPATCH] Connecting to api.resend.com for " + recipientEmail);
                    String jsonPayload = String.format("""
                        {
                          "from": "onboarding@resend.dev",
                          "to": ["%s"],
                          "subject": "Presentation Evaluator - Password Reset OTP",
                          "html": "<div style=\\"font-family: Arial, sans-serif; padding: 20px;\\"><h2 style=\\"color: #6366f1;\\">Presentation Evaluator</h2><p>Hello,</p><p>We received a request to reset your Presentation Evaluator account password.</p><p>Your 6-digit verification code is:</p><div style=\\"background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e293b; text-align: center; margin: 20px 0;\\">%s</div><p>This code is valid for 5 minutes.</p><p style=\\"color: #64748b; font-size: 12px;\\">If you did not request this reset, you can safely ignore this email.</p></div>"
                        }
                        """, recipientEmail, otpCode);

                    java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
                    java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                            .uri(java.net.URI.create("https://api.resend.com/emails"))
                            .header("Authorization", "Bearer " + resendApiKey.trim())
                            .header("Content-Type", "application/json")
                            .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload))
                            .build();

                    java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
                    System.out.println(">>> [RESEND RESPONSE STATUS " + response.statusCode() + "]: " + response.body());
                    if (response.statusCode() >= 200 && response.statusCode() < 300) {
                        log.info("Successfully dispatched HTTPS email via Resend to {}: {}", recipientEmail, response.body());
                        return;
                    } else {
                        log.warn("Resend API returned status {}: {}", response.statusCode(), response.body());
                    }
                } catch (Exception e) {
                    System.err.println(">>> [RESEND DISPATCH ERROR]: " + e.getMessage());
                    log.error("Resend HTTPS dispatch failed: {}", e.getMessage(), e);
                }
            } else {
                System.out.println(">>> [RESEND NOTICE] No RESEND_API_KEY detected in environment. Attempting SMTP...");
            }

            // Fallback to standard SMTP
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
            } catch (Exception e) {
                log.error("SMTP delivery to {} failed: {}", recipientEmail, e.getMessage(), e);
            }
        });
        return true;
    }
}
