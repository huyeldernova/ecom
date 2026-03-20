package com.example.profileservice.service;

import com.example.profileservice.dto.AddressRequest;
import com.example.profileservice.dto.AddressResponse;
import com.example.profileservice.entity.Address;
import com.example.profileservice.entity.UserProfile;
import com.example.profileservice.exception.AppException;
import com.example.profileservice.exception.ErrorCode;
import com.example.profileservice.repository.AddressRepository;
import com.example.profileservice.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressService {


    private final AddressRepository addressRepository;
    private final UserProfileRepository userProfileRepository;

    // Lấy tất cả addresses của user
    public List<AddressResponse> getAddresses(UUID userId){
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));


        List<Address> addresses = addressRepository.findAllByProfileId(profile.getId());

        return addresses.stream()
                .map(a -> AddressResponse.builder()
                        .id(a.getId())
                        .fullName(a.getFullName())
                        .phone(a.getPhone())
                        .street(a.getStreet())
                        .city(a.getCity())
                        .country(a.getCountry())
                        .defaultAddress(a.isDefaultAddress())
                        .label(a.getLabel())
                        .build())
                .toList();
    }


    // Thêm address mới
    public AddressResponse addAddress(UUID userId, AddressRequest request){
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

        if(request.isDefaultAddress()){
            addressRepository.clearAllDefaults(profile.getId());
        }

        Address address = Address.builder()
                .profileId(profile.getId())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .street(request.getStreet())
                .city(request.getCity())
                .country(request.getCountry())
                .defaultAddress(request.isDefaultAddress())
                .label(request.getLabel())
                .build();

        Address saved = addressRepository.save(address);

        return AddressResponse.builder()
                .id(saved.getId())
                .fullName(saved.getFullName())
                .phone(saved.getPhone())
                .street(saved.getStreet())
                .city(saved.getCity())
                .country(saved.getCountry())
                .defaultAddress(saved.isDefaultAddress())
                .label(saved.getLabel())
                .build();

    }

    // Sửa address
    @Transactional
    public AddressResponse updateAddress(UUID userId, UUID addressId, AddressRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

        Address address = addressRepository.findByIdAndProfileId(addressId, profile.getId())
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        if (request.isDefaultAddress()) {
            addressRepository.clearAllDefaults(profile.getId());
        }

        // Update fields
        if (request.getFullName() != null) {
            address.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            address.setPhone(request.getPhone());
        }
        if (request.getStreet() != null) {
            address.setStreet(request.getStreet());
        }
        if (request.getCity() != null) {
            address.setCity(request.getCity());
        }
        if (request.getCountry() != null) {
            address.setCountry(request.getCountry());
        }
        if (request.getLabel() != null) {
            address.setLabel(request.getLabel());
        }
        address.setDefaultAddress(request.isDefaultAddress());

        Address saved = addressRepository.save(address);

        return AddressResponse.builder()
                .id(saved.getId())
                .fullName(saved.getFullName())
                .phone(saved.getPhone())
                .street(saved.getStreet())
                .city(saved.getCity())
                .country(saved.getCountry())
                .defaultAddress(saved.isDefaultAddress())
                .label(saved.getLabel())
                .build();
    }

    // Xóa address
    public void deleteAddress(UUID userId, UUID addressId){
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

        Address address = addressRepository.findByIdAndProfileId(addressId, profile.getId())
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        addressRepository.delete(address);
    }

    // Set default
    public void setDefault(UUID userId, UUID addressId){
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

        Address address = addressRepository.findByIdAndProfileId(addressId, profile.getId())
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        addressRepository.clearAllDefaults(profile.getId());
        address.setDefaultAddress(true);
        addressRepository.save(address);
    }
}
