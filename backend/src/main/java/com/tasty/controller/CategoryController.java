package com.tasty.controller;

import com.tasty.config.OpenApiConfig;
import com.tasty.dto.category.CategoryDto;
import com.tasty.dto.category.CategoryRequest;
import com.tasty.dto.common.ApiResponse;
import com.tasty.dto.common.PageResponse;
import com.tasty.service.CategoryService;
import com.tasty.util.Paging;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Categories")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "List categories",
            description = "Ordered by display order. Guests only receive active categories; signed-in staff can "
                    + "filter with `active` or omit it to get every category.")
    @GetMapping
    public ApiResponse<PageResponse<CategoryDto>> list(
            @Parameter(description = "Search in names and descriptions") @RequestParam(required = false) String q,
            @Parameter(description = "Staff only: filter by active flag") @RequestParam(required = false) Boolean active,
            @Parameter(description = "Zero-based page index") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (1-100)") @RequestParam(defaultValue = "50") int size) {
        Paging.check(page, size);
        return ApiResponse.ok(categoryService.list(q, active, page, size));
    }

    @Operation(summary = "Get a category by id")
    @GetMapping("/{id}")
    public ApiResponse<CategoryDto> get(@PathVariable Long id) {
        return ApiResponse.ok(categoryService.get(id));
    }

    @Operation(summary = "Get a category by slug")
    @GetMapping("/slug/{slug}")
    public ApiResponse<CategoryDto> getBySlug(@PathVariable String slug) {
        return ApiResponse.ok(categoryService.getBySlug(slug));
    }

    @Operation(summary = "Create a category", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CategoryDto> create(@Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok(categoryService.create(request), "Category created");
    }

    @Operation(summary = "Update a category", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PutMapping("/{id}")
    public ApiResponse<CategoryDto> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok(categoryService.update(id, request), "Category updated");
    }

    @Operation(summary = "Delete a category",
            description = "Refused with 409 while dishes belong to the category, unless `reassignTo` names the "
                    + "category those dishes should move to.",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable Long id,
            @Parameter(description = "Category that receives this category's dishes") @RequestParam(required = false) Long reassignTo) {
        categoryService.delete(id, reassignTo);
        return ApiResponse.message("Category deleted");
    }
}
