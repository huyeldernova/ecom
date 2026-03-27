package com.example.productservice.service;

import com.example.event.VariantCreatedEvent;
import com.example.productservice.client.FileServiceClient;
import com.example.productservice.dto.*;
import com.example.productservice.dto.client.LinkFilesRequest;
import com.example.productservice.entity.Category;
import com.example.productservice.entity.Product;
import com.example.productservice.entity.ProductVariant;
import com.example.productservice.entity.enums.ProductStatus;
import com.example.productservice.exception.AppException;
import com.example.productservice.exception.ErrorCode;
import com.example.productservice.repository.CategoryRepository;
import com.example.productservice.repository.ProductRepository;
import com.example.productservice.repository.ProductVariantRepository;
import com.example.productservice.specification.ProductSpecifications;
import com.example.productservice.utils.Slug;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final FileServiceClient fileServiceClient;
    private final KafkaTemplate<String, VariantCreatedEvent> kafkaTemplate;

    @Transactional
    public ProductDetailResponse create(ProductRequest request, UUID userId) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        String generate = Slug.generate(request.getBrand() + " " + request.getName());
        if (productRepository.existsBySlug(generate)) {
            throw new AppException(ErrorCode.PRODUCT_ALREADY_EXISTS);
        }

        Product product = Product.builder()
                .name(request.getName())
                .slug(generate)
                .brand(request.getBrand())
                .description(request.getDescription())
                .price(request.getPrice())
                .thumbnailUrl(request.getThumbnailUrl())
                .imageUrls(request.getImageUrls() != null
                        ? request.getImageUrls() : new ArrayList<>())
                .category(category)
                .variants(new ArrayList<>())
                .build();

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            for (VariantRequest variantRequest : request.getVariants()) {
                if (productVariantRepository.existsBySku(variantRequest.getSku())) {
                    throw new AppException(ErrorCode.SKU_ALREADY_EXISTS);
                }

                String sku = (variantRequest.getSku() != null
                        && !variantRequest.getSku().isBlank())
                        ? variantRequest.getSku()
                        : generateSku(request.getBrand(), request.getName(),
                        variantRequest.getColor(), variantRequest.getSize());

                ProductVariant variant = ProductVariant.builder()
                        .sku(sku)
                        .size(variantRequest.getSize())
                        .color(variantRequest.getColor())
                        .finalPrice(variantRequest.getFinalPrice())
                        .imageUrls(variantRequest.getImageUrls())
                        .build();

                product.addVariant(variant);
            }
        }

        try {
            productRepository.save(product);

            if (request.getFileIds() != null && !request.getFileIds().isEmpty()) {
                fileServiceClient.linkFiles(
                        LinkFilesRequest.builder()
                                .fileIds(request.getFileIds())
                                .targetId(product.getId())
                                .targetType("PRODUCT")
                                .requesterId(userId)
                                .build()
                );
            }

            for (ProductVariant v : product.getVariants()) {
                kafkaTemplate.send("variant.created",
                        VariantCreatedEvent.builder()
                                .variantId(v.getId())
                                .productId(product.getId())
                                .sku(v.getSku())
                                .build()
                );
            }

        } catch (Exception e) {
            // Compensation: xóa files đã upload nếu có lỗi
            if (request.getFileIds() != null && !request.getFileIds().isEmpty()) {
                try {
                    fileServiceClient.deleteByIds(request.getFileIds());
                } catch (Exception deleteEx) {
                    // Cleanup job sẽ dọn sau — không throw để tránh mask exception gốc
                }
            }
            throw e;
        }

        return toDetailResponse(product);
    }

    @Transactional
    public VariantResponse addVariant(UUID productId, VariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if(productVariantRepository.existsBySku(request.getSku())) {
            throw new AppException(ErrorCode.SKU_ALREADY_EXISTS);
        }

        String sku = (request.getSku() != null && !request.getSku().isBlank())
                ? request.getSku()
                : generateSku(product.getBrand(), product.getName(),
                request.getColor(), request.getSize());

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(sku)
                .size(request.getSize())
                .color(request.getColor())
                .finalPrice(request.getFinalPrice())
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : new ArrayList<>())
                .build();

        product.addVariant(variant);

        ProductVariant saved = productVariantRepository.save(variant);

        kafkaTemplate.send("variant.created",
                VariantCreatedEvent.builder()
                        .variantId(saved.getId())
                        .productId(product.getId())
                        .sku(saved.getSku())
                        .build()
        );

        return toVariantResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "variants", key = "#variantId")
    public void deleteVariant(UUID productId, UUID variantId){
        productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        if(!variant.getProduct().getId().equals(productId)){
            throw new AppException(ErrorCode.VARIANT_NOT_FOUND);
        }
        variant.setIsActive(false);

        productVariantRepository.save(variant);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> getAll(int page, int size){
        Pageable pageable = PageRequest.of(page, size);

        Page<Product> productPage = productRepository.findAll(pageable);

        List<ProductSummaryResponse> content = productPage.getContent().stream()
                .map(this::toSummaryResponse)
                .toList();

        return PageResponse.<ProductSummaryResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .result(content)
                .build();
    }

    @Cacheable(value = "products", key = "#id")
    public ProductDetailResponse getById(UUID id){

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        return toDetailResponse(product);
    }

    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public void delete (UUID id){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setStatus(ProductStatus.INACTIVE);

        productRepository.save(product);
    }

    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public ProductDetailResponse update (ProductUpdateRequest request, UUID id){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if(request.getName() != null || request.getBrand() != null) {
            String newName = request.getName() != null
                    ? request.getName() : product.getName();
            String newBrand = request.getBrand() != null
                    ? request.getBrand() : product.getBrand();

            String newSlug = Slug.generate(newBrand + " " + newName);

            if(productRepository.existsBySlugAndIdNot(newSlug, id)) {
                throw new AppException(ErrorCode.PRODUCT_ALREADY_EXISTS);
            }
            product.setSlug(newSlug);
            product.setName(newName);
            product.setBrand(newBrand);
        }

        if(request.getPrice() != null){
            product.setPrice(request.getPrice());
        }

        if(request.getDescription() != null){
            product.setDescription(request.getDescription());
        }

        if(request.getImageUrls() != null){
            product.setImageUrls(request.getImageUrls());
        }

        if(request.getThumbnailUrl() != null){
            product.setThumbnailUrl(request.getThumbnailUrl());
        }

        if(request.getCategoryId() != null){
            Category newCategory = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            product.setCategory(newCategory);
        }


        productRepository.save(product);

        return toDetailResponse(product);

    }

    @Transactional
    @CacheEvict(value = "variants", key = "#variantId")

    public VariantResponse updateVariant(UUID productId, UUID variantId, VariantUpdateRequest request) {
        // 1. Tìm product
        productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        // 2. Tìm variant
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
        // 3. Check variant thuộc product
        if(!variant.getProduct().getId().equals(productId)){
            throw new AppException(ErrorCode.VARIANT_NOT_FOUND);
        }
        // 4. Nếu SKU != null → check trùng → set
        if(request.getSku() != null){
            if(productVariantRepository.existsBySkuAndIdNot(request.getSku(), variantId)){
                throw new AppException(ErrorCode.SKU_ALREADY_EXISTS);
            }
            variant.setSku(request.getSku());
        }
        // 5. Update fields còn lại
        if(request.getSize() != null){
            variant.setSize(request.getSize());
        }
        if(request.getColor() != null){
            variant.setColor(request.getColor());
        }
        if(request.getFinalPrice() != null){
            variant.setFinalPrice(request.getFinalPrice());
        }
        if(request.getImageUrls() != null){
            variant.setImageUrls(request.getImageUrls());
        }
        // 6. Save + return
        productVariantRepository.save(variant);
        return toVariantResponse(variant);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> getAll(ProductFilterRequest filter){

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize());

        Specification<Product> spec = Specification
                .where(ProductSpecifications.isActive())
                .and(ProductSpecifications.hasName(filter.getName()))
                .and(ProductSpecifications.hasBrand(filter.getBrand()))
                .and(ProductSpecifications.inCategory(filter.getCategoryId()))
                .and(ProductSpecifications.priceBetween(filter.getMinPrice(), filter.getMaxPrice()));

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<ProductSummaryResponse> content = productPage.getContent().stream()
                .map(this::toSummaryResponse)
                .toList();

        return PageResponse.<ProductSummaryResponse>builder()
                .currentPage(filter.getPage())
                .pageSize(filter.getSize())
                .totalPages(productPage.getTotalPages())
                .totalElements(productPage.getTotalElements())
                .result(content)
                .build();
    }

    @Cacheable(value = "variants", key = "#variantId")
    public VariantResponse getVariantById(UUID productId, UUID variantId) {
        // 1. Tìm product → không thấy → throw PRODUCT_NOT_FOUND
        productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        // 2. Tìm variant → không thấy → throw VARIANT_NOT_FOUND
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
        // 3. Check variant.getProduct().getId() == productId
        //    → không khớp → throw VARIANT_NOT_FOUND
        if(!variant.getProduct().getId().equals(productId)){
            throw new AppException(ErrorCode.VARIANT_NOT_FOUND);
        }
        // 4. Check isActive = false → throw INVALID_PRODUCT_VARIANT
        if(!variant.getIsActive()){
            throw new AppException(ErrorCode.INVALID_PRODUCT_VARIANT);
        }
        // 6. Return toVariantResponse(variant)
        return toVariantResponse(variant);
    }

    public VariantResponse getVariantById(UUID variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));
        return toVariantResponse(variant);
    }

        private VariantResponse toVariantResponse(ProductVariant variant){

            String variantName = Stream.of(variant.getSize(), variant.getColor())
                    .filter(s -> s != null && !s.isBlank())
                    .collect(Collectors.joining(" - "));

        return VariantResponse.builder()
                .id(variant.getId())
                .sku(variant.getSku())
                .effectivePrice(variant.getEffectivePrice())
                .size(variant.getSize())
                .color(variant.getColor())
                .productName(variant.getProduct().getName())
                .variantName(variantName)
                .isActive(variant.getIsActive())
                .finalPrice(variant.getFinalPrice())
                .imageUrls(variant.getImageUrls())
                .categoryName(variant.getProduct().getCategory().getName())
                .build();
    }

    private ProductDetailResponse toDetailResponse(Product product){

        List<VariantResponse> variants = product.getVariants().stream()
                .map(this::toVariantResponse)
                .toList();

        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .imageUrls(product.getImageUrls())
                .status(product.getStatus().name())
                .brand(product.getBrand())
                .price(product.getPrice())
                .thumbnailUrl(product.getThumbnailUrl())
                .categoryId(product.getCategory().getId())
                .variants(variants)
                .build();
    }

    private ProductSummaryResponse toSummaryResponse(Product product){
        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .brand((product.getBrand()))
                .price((product.getPrice()))
                .thumbnailUrl(product.getThumbnailUrl())
                .status(product.getStatus().name())
                .categoryId(product.getCategory().getId())
                .build();
    }

    private String generateSku(String brand, String productName, String color, String size) {
        String brandPart = brand != null
                ? brand.toUpperCase().replaceAll("\\s+", "").substring(0, Math.min(4, brand.length()))
                : "PROD";

        String namePart = productName != null
                ? productName.toUpperCase().replaceAll("\\s+", "").substring(0, Math.min(4, productName.length()))
                : "ITEM";

        String colorPart = (color != null && !color.isBlank())
                ? color.toUpperCase().replaceAll("\\s+", "").substring(0, Math.min(3, color.length()))
                : "NA";

        String sizePart = (size != null && !size.isBlank())
                ? size.toUpperCase().replaceAll("\\s+", "")
                : "OS";

        String random = String.valueOf((int)(Math.random() * 9000) + 1000);

        String sku = brandPart + "-" + namePart + "-" + colorPart + "-" + sizePart + "-" + random;

        // Đảm bảo không bị trùng
        if (productVariantRepository.existsBySku(sku)) {
            random = String.valueOf((int)(Math.random() * 9000) + 1000);
            sku = brandPart + "-" + namePart + "-" + colorPart + "-" + sizePart + "-" + random;
        }

        return sku;
    }


}
