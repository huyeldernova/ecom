package com.example.productservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant extends BaseEntity{

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "sku", nullable = false, unique = true, length = 100)
    private String sku;

    @Column(name = "size", nullable = false, length = 10)
    private String size;

    @Column(name = "color", nullable = false, length = 50)
    private String color;

    @Column(name = "image_urls", columnDefinition = "json")
    private List<String> imageUrls;

    @Column(name = "price_override", precision = 12, scale = 2)
    private BigDecimal finalPrice;

//    @Column(name = "stock_quantity", nullable = false)
//    @Builder.Default
//    private Integer stockQuantity = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public BigDecimal getEffectivePrice() {
        return (this.finalPrice != null) ? this.finalPrice : this.product.getPrice();
    }

}
