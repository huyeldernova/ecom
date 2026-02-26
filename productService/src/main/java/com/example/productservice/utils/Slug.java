package com.example.productservice.utils;

import java.text.Normalizer;

public class Slug {
    public static String generate(String name) {
        String slug = name.toLowerCase();
        slug = Normalizer.normalize(slug, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", ""); // bỏ dấu
        slug = slug.replaceAll("[^a-z0-9\\s]", ""); // xóa ký tự đặc biệt
        slug = slug.trim().replaceAll("\\s+", "-"); // replace space
        return slug;
    }
}
