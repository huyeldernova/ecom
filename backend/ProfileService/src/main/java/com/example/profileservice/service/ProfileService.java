package com.example.profileservice.service;

import com.example.profileservice.dto.ProfileResponse;
import com.example.profileservice.dto.UpdateProfileRequest;
import com.example.profileservice.entity.UserProfile;
import com.example.profileservice.exception.AppException;
import com.example.profileservice.exception.ErrorCode;
import com.example.profileservice.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(UUID userId) {

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

        return ProfileResponse.builder()
                .id(profile.getId())
                .userName(profile.getUserName())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .birthDate(profile.getBirthDate())
                .gender(profile.getGender())
                .phoneNumber(profile.getPhoneNumber())
                .bio(profile.getBio())
                .avatar(profile.getAvatar())
                .build();
    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

        if(request.getUserName() != null){
            profile.setUserName(request.getUserName());
        }
        if (request.getFirstName() != null) {
            profile.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            profile.setLastName(request.getLastName());
        }
        if (request.getBirthDate() != null) {
            profile.setBirthDate(request.getBirthDate());
        }
        if (request.getGender() != null) {
            profile.setGender(request.getGender());
        }
        if (request.getPhoneNumber() != null) {
            profile.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getAvatar() != null) {
            profile.setAvatar(request.getAvatar());
        }

        UserProfile save = userProfileRepository.save(profile);

        return ProfileResponse.builder()
                .id(save.getId())
                .userName(save.getUserName())
                .firstName(save.getFirstName())
                .lastName(save.getLastName())
                .birthDate(save.getBirthDate())
                .gender(save.getGender())
                .phoneNumber(save.getPhoneNumber())
                .bio(save.getBio())
                .avatar(save.getAvatar())
                .build();
    }

    public void createProfile(UUID userId, String name) {

        if(userProfileRepository.existsByUserId(userId)){
            log.info("Profile already exists for userId: {}", userId);
            return;
        }

        String[] parts = name.split(" ");
        String firstName = parts[0];
        String lastName = parts.length > 1 ? parts[1] : "";

        UserProfile profile = UserProfile.builder()
                .userId(userId)
                .firstName(firstName)
                .lastName(lastName)
                .build();

        userProfileRepository.save(profile);

        log.info("Profile created for userId: {}", userId);
    }



}


