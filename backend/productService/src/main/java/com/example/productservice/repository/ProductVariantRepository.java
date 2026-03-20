package com.example.productservice.repository;

import com.example.productservice.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
    boolean existsBySkuAndIdNot(String sku, UUID id);
    boolean existsBySku(String sku);

}
