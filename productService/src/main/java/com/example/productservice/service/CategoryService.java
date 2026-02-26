package com.example.productservice.service;

import com.example.productservice.dto.CategoryRequest;
import com.example.productservice.dto.CategoryResponse;
import com.example.productservice.dto.CategoryUpdateRequest;
import com.example.productservice.entity.Category;
import com.example.productservice.exception.AppException;
import com.example.productservice.exception.ErrorCode;
import com.example.productservice.repository.CategoryRepository;
import com.example.productservice.utils.Slug;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;


@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryResponse create (CategoryRequest request){

        Category parent = null;
        if(request.getParentId() != null){
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        }
        String slug = generateUniqueSlug(request.getName(), parent);

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .parent(parent)
                .build();

        categoryRepository.save(category);

        return toResponse(category);
    }

    @Transactional
    public CategoryResponse update(UUID id, CategoryUpdateRequest request) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if(request.getName() != null){
            if(request.getName().isBlank()){
                throw new AppException(ErrorCode.INVALID_INPUT);
            }
            category.setName(request.getName());
            category.setSlug(generateUniqueSlug(request.getName(), category.getParent()));
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if(request.getDisplayOrder() != null){
            category.setDisplayOrder(request.getDisplayOrder());
        }

        if (request.getImageUrl() != null) {
            category.setImageUrl(request.getImageUrl());
        }

        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

        if(request.getParentId() != null) {
            Category newParent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            category.setParent(newParent);
        }

        categoryRepository.save(category);

        return toResponse(category);
    }

    public List<CategoryResponse> getTree(){

        List<Category> categories = categoryRepository.findAll();

        Map<UUID, CategoryResponse> map = new LinkedHashMap<>();
        for(Category category: categories){
            map.put(category.getId(), toResponse(category));
        }

        List<CategoryResponse> roots = new ArrayList<>();
        for(Category category : categories){
            if(category.getParent() == null){
                roots.add(map.get(category.getId()));
            }else{
                UUID parentId = category.getParent().getId();
                map.get(parentId).getChildren().add(map.get(category.getId()));
            }
        }
        return roots;
    }

    @Transactional
    public void delete(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        categoryRepository.delete(category);
    }

    private String generateUniqueSlug(String name, Category parent){
        String baseSlug = Slug.generate(name);
       if(parent == null){
           return baseSlug;
       }
       return parent.getSlug() + "/" + baseSlug;
    }

    private CategoryResponse toResponse (Category category){
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .displayOrder(category.getDisplayOrder())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .children(new ArrayList<>())
                .isActive(category.getIsActive())
                .build();
    }

}
//1. Generate slug từ name
//2. Check slug đã tồn tại chưa?
//3. Nếu có parentId → tìm parent category trong DB
//4. Nếu không tìm thấy parent → throw exception gì?
//5. Build entity Category từ request
//6. Save vào DB
//7. Convert entity → Response rồi return