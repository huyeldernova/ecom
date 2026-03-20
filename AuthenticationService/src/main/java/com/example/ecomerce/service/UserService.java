package com.example.ecomerce.service;

import com.example.ecomerce.dto.reponse.RegisterResponse;
import com.example.ecomerce.dto.request.RegisterRequest;
import com.example.ecomerce.entity.Role;
import com.example.ecomerce.entity.User;
import com.example.ecomerce.exception.AppException;
import com.example.ecomerce.exception.ErrorCode;
import com.example.ecomerce.repository.RoleRepository;
import com.example.ecomerce.repository.UserRepository;
import com.example.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final KafkaTemplate<String, UserRegisteredEvent> kafkaTemplate;


    @Transactional
    public RegisterResponse register(RegisterRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .build();

        Role role = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(Role.builder()
                                .name("USER")
                        .build()
                        )
                );
        user.addRole(role);

        userRepository.save(user);

        kafkaTemplate.send("user.registered",
                UserRegisteredEvent.builder()
                        .userId(user.getId())
                        .email(user.getEmail())
                        .name(request.getFirstName() + " " + request.getLastName())
                        .build()
        );

        return RegisterResponse.builder()
                .email(user.getEmail())
                .build();
    }
}
