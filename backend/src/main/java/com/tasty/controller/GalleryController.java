package com.tasty.controller;

import com.tasty.config.OpenApiConfig;
import com.tasty.dto.common.ApiResponse;
import com.tasty.dto.common.PageResponse;
import com.tasty.dto.gallery.GalleryImageDto;
import com.tasty.dto.gallery.GalleryImageRequest;
import com.tasty.entity.GalleryCategory;
import com.tasty.entity.GalleryGroup;
import com.tasty.service.GalleryService;
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

import java.util.List;

@Tag(name = "Gallery")
@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    @Operation(summary = "List gallery photos",
            description = "Featured photos first, then by display order. Filter the food gallery with `group=FOOD` "
                    + "or the restaurant gallery with `group=RESTAURANT`; `category` may be repeated.")
    @GetMapping
    public ApiResponse<PageResponse<GalleryImageDto>> list(
            @Parameter(description = "FOOD or RESTAURANT") @RequestParam(required = false) GalleryGroup group,
            @Parameter(description = "One or more categories, e.g. category=BURGER&category=SANDWICH")
            @RequestParam(required = false) List<GalleryCategory> category,
            @Parameter(description = "Only featured photos") @RequestParam(required = false) Boolean featured,
            @Parameter(description = "Photos assigned to this dish") @RequestParam(required = false) Long menuItemId,
            @Parameter(description = "Search titles and descriptions") @RequestParam(required = false) String q,
            @Parameter(description = "gallery (default) or newest") @RequestParam(required = false) String sort,
            @Parameter(description = "Zero-based page index") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (1-100)") @RequestParam(defaultValue = "24") int size) {
        Paging.check(page, size);
        boolean newestFirst = "newest".equalsIgnoreCase(sort);
        return ApiResponse.ok(galleryService.list(group, category, featured, menuItemId, q, newestFirst, page, size));
    }

    @Operation(summary = "Get a gallery photo")
    @GetMapping("/{id}")
    public ApiResponse<GalleryImageDto> get(@PathVariable Long id) {
        return ApiResponse.ok(galleryService.get(id));
    }

    @Operation(summary = "Add a gallery photo",
            description = "Upload the file first with `POST /api/images`, then send its url and storageKey here.",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<GalleryImageDto> create(@Valid @RequestBody GalleryImageRequest request) {
        return ApiResponse.ok(galleryService.create(request), "Photo added");
    }

    @Operation(summary = "Update or replace a gallery photo",
            description = "Sending a different storageKey replaces the photo; the previous upload is deleted.",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PutMapping("/{id}")
    public ApiResponse<GalleryImageDto> update(@PathVariable Long id, @Valid @RequestBody GalleryImageRequest request) {
        return ApiResponse.ok(galleryService.update(id, request), "Photo updated");
    }

    @Operation(summary = "Delete a gallery photo", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        galleryService.delete(id);
        return ApiResponse.message("Photo deleted");
    }
}
