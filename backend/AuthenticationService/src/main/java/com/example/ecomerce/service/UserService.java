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
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
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
    private final OutboxRepository outboxRepository; // ← THÊM
    private final ObjectMapper objectMapper;


    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        // 1. Check email tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // 2. Tạo user
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .build();

        // 3. Gán role USER
        Role role = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name("USER")
                                .build()
                ));
        user.addRole(role);

        // 4. Lưu user
        userRepository.save(user);

        // 5. Lưu outbox — CÙNG TRANSACTION với userRepository.save()!
        try {
            UserRegisteredEvent event = UserRegisteredEvent.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .name(request.getFirstName() + " " + request.getLastName())
                    .build();

            String payload = objectMapper.writeValueAsString(event);

            outboxRepository.save(
                    OutboxEvent.builder()
                            .topic("user.registered")
                            .payload(payload)
                            .eventType(UserRegisteredEvent.class.getName())
                            .build()
            );

            log.info("Register success + outbox saved for userId: {}",
                    user.getId());

        } catch (Exception e) {
            // Nếu lỗi → transaction rollback cả user lẫn outbox!
            log.error("Failed to save outbox: {}", e.getMessage());
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        // 6. Return response
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
