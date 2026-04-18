package com.example.ecomerce.service;

import com.example.ecomerce.dto.reponse.RegisterResponse;
import com.example.ecomerce.dto.request.RegisterRequest;
import com.example.ecomerce.entity.OutboxEvent;
import com.example.ecomerce.entity.Role;
import com.example.ecomerce.entity.User;
import com.example.ecomerce.exception.AppException;
import com.example.ecomerce.exception.ErrorCode;
import com.example.ecomerce.repository.OutboxRepository;
import com.example.ecomerce.repository.RoleRepository;
import com.example.ecomerce.repository.UserRepository;
import com.example.event.UserRegisteredEvent;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(false)
                .emailVerified(false)
                .build();

        Role role = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name("USER").build()
                ));
        user.addRole(role);
        userRepository.save(user);

        // KHÔNG còn outbox "user.registered" ở đây nữa
        // Profile chỉ được tạo sau khi verify email thành công

        // Gửi OTP verification
        emailVerificationService.generateAndSendOtp(user);

        return RegisterResponse.builder()
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }

    public void assignRole(UUID userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(roleName).build()
                ));

        user.addRole(role);
        userRepository.save(user);
    }
}