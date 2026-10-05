package com.presentation.evaluator;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.presentation.evaluator.dto.*;
import com.presentation.evaluator.entity.PasswordResetOtpEntity;
import com.presentation.evaluator.entity.UserEntity;
import com.presentation.evaluator.repository.PasswordResetOtpRepository;
import com.presentation.evaluator.repository.PasswordResetTokenRepository;
import com.presentation.evaluator.repository.UserRepository;
import com.presentation.evaluator.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetOtpRepository otpRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EmailService emailService;

    private final String testEmail = "testuser@evaluator.com";
    private final String oldPassword = "OldPassword123!";
    private final String newPassword = "NewPassword456$";

    @BeforeEach
    void setUp() {
        tokenRepository.deleteAll();
        otpRepository.deleteAll();
        userRepository.deleteAll();
        when(emailService.sendOtpEmail(eq(testEmail), org.mockito.ArgumentMatchers.anyString())).thenReturn(true);
    }

    @Test
    void testCompleteForgotPasswordAndResetFlow() throws Exception {
        // 1. Register User
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setName("Test Speaker");
        registerReq.setEmail(testEmail);
        registerReq.setPassword(oldPassword);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        UserEntity user = userRepository.findByEmail(testEmail).orElseThrow();
        assertTrue(passwordEncoder.matches(oldPassword, user.getPassword()));

        // 2. Login with Old Password (MUST SUCCEED)
        LoginRequest loginOldReq = new LoginRequest();
        loginOldReq.setEmail(testEmail);
        loginOldReq.setPassword(oldPassword);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginOldReq)))
                .andExpect(status().isOk());

        // 3. Request Forgot Password
        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest(testEmail);
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forgotReq)))
                .andExpect(status().isOk());

        // Verify OTP is stored in DB as hash (NOT plain text)
        PasswordResetOtpEntity otpEntity = otpRepository.findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId()).orElseThrow();
        assertNotNull(otpEntity.getOtpHash());
        assertFalse(otpEntity.getOtpHash().equals("123456"));

        // Capture real OTP sent to EmailService
        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendOtpEmail(eq(testEmail), otpCaptor.capture());
        String generatedOtp = otpCaptor.getValue();
        assertNotNull(generatedOtp);
        assertEquals(6, generatedOtp.length());

        // 4. Test Invalid OTP Attempt (MUST REJECT)
        VerifyOtpRequest wrongOtpReq = new VerifyOtpRequest(testEmail, "000000");
        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongOtpReq)))
                .andExpect(status().isBadRequest());

        // 5. Verify Correct Captured OTP
        VerifyOtpRequest validOtpReq = new VerifyOtpRequest(testEmail, generatedOtp);
        MvcResult verifyResult = mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validOtpReq)))
                .andExpect(status().isOk())
                .andReturn();

        ApiResponse verifyResp = objectMapper.readValue(verifyResult.getResponse().getContentAsString(), ApiResponse.class);
        assertTrue(verifyResp.isSuccess());
        assertNotNull(verifyResp.getResetToken());
        String resetToken = verifyResp.getResetToken();

        // 6. Reset Password with New Password
        ResetPasswordRequest resetReq = new ResetPasswordRequest(testEmail, resetToken, newPassword);
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk());

        // Verify updated password in DB
        UserEntity updatedUser = userRepository.findByEmail(testEmail).orElseThrow();
        assertTrue(passwordEncoder.matches(newPassword, updatedUser.getPassword()));
        assertFalse(passwordEncoder.matches(oldPassword, updatedUser.getPassword()));

        // 7. Login with OLD Password (MUST FAIL)
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginOldReq)))
                .andExpect(status().isUnauthorized());

        // 8. Login with NEW Password (MUST SUCCEED)
        LoginRequest loginNewReq = new LoginRequest();
        loginNewReq.setEmail(testEmail);
        loginNewReq.setPassword(newPassword);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginNewReq)))
                .andExpect(status().isOk());

        // 9. Reuse Reset Token (MUST FAIL)
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isBadRequest());
    }
}
