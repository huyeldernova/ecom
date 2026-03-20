package com.example.profileservice.repository;

import com.example.profileservice.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {
    Optional<Address>findByUserId(UUID userId);

    List<Address> findAllByProfileId(UUID profileId);
    Optional<Address> findByIdAndProfileId(UUID id, UUID profileId);

    @Modifying
    @Query("UPDATE Address a SET a.defaultAddress = false WHERE a.profileId = :profileId")
    void clearAllDefaults(@Param("profileId") UUID profileId);


}
