package com.tasty.controller;

import com.tasty.config.OpenApiConfig;
import com.tasty.dto.common.ApiResponse;
import com.tasty.dto.common.PageResponse;
import com.tasty.dto.menu.MenuItemDto;
import com.tasty.dto.menu.MenuItemRequest;
import com.tasty.dto.menu.MenuItemStatusRequest;
import com.tasty.dto.menu.MenuItemSummaryDto;
import com.tasty.service.MenuItemService;
import com.tasty.service.MenuItemService.MenuSearch;
import com.tasty.service.MenuItemService.MenuSort;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Menu")
@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuItemService menuItemService;

    @Operation(summary = "Search the menu",
            description = "Paginated dishes. `q` matches names, descriptions and ingredients in English and French. "
                    + "Guests never receive dishes from inactive categories.")
    @GetMapping
    public ApiResponse<PageResponse<MenuItemSummaryDto>> search(
            @Parameter(description = "Free-text search") @RequestParam(required = false) String q,
            @Parameter(description = "Category slug, e.g. `burgers`") @RequestParam(required = false) String category,
            @Parameter(description = "Category id") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Only available (true) or sold-out (false) dishes") @RequestParam(required = false) Boolean available,
            @Parameter(description = "Only featured dishes") @RequestParam(required = false) Boolean featured,
            @Parameter(description = "Only vegetarian dishes") @RequestParam(required = false) Boolean vegetarian,
            @Parameter(description = "Only spicy dishes") @RequestParam(required = false) Boolean spicy,
            @Parameter(description = "menu (default), newest, updated, name, price-asc, price-desc") @RequestParam(required = false) String sort,
            @Parameter(description = "Zero-based page index") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (1-100)") @RequestParam(defaultValue = "12") int size) {
        Paging.check(page, size);
        var search = new MenuSearch(q, categoryId, category, available, featured, vegetarian, spicy, MenuSort.parse(sort));
        return ApiResponse.ok(menuItemService.search(search, page, size));
    }

    @Operation(summary = "Get a dish by id")
    @GetMapping("/{id}")
    public ApiResponse<MenuItemDto> get(@PathVariable Long id) {
        return ApiResponse.ok(menuItemService.get(id));
    }

    @Operation(summary = "Get a dish by slug")
    @GetMapping("/slug/{slug}")
    public ApiResponse<MenuItemDto> getBySlug(@PathVariable String slug) {
        return ApiResponse.ok(menuItemService.getBySlug(slug));
    }

    @Operation(summary = "Create a dish", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MenuItemDto> create(@Valid @RequestBody MenuItemRequest request) {
        return ApiResponse.ok(menuItemService.create(request), "Dish created");
    }

    @Operation(summary = "Update a dish",
            description = "Full update. Images missing from the request are removed and their uploaded files deleted.",
            security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PutMapping("/{id}")
    public ApiResponse<MenuItemDto> update(@PathVariable Long id, @Valid @RequestBody MenuItemRequest request) {
        return ApiResponse.ok(menuItemService.update(id, request), "Dish updated");
    }

    @Operation(summary = "Toggle availability or featured status", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PatchMapping("/{id}/status")
    public ApiResponse<MenuItemSummaryDto> updateStatus(@PathVariable Long id, @Valid @RequestBody MenuItemStatusRequest request) {
        return ApiResponse.ok(menuItemService.updateStatus(id, request), "Dish updated");
    }

    @Operation(summary = "Delete a dish", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        menuItemService.delete(id);
        return ApiResponse.message("Dish deleted");
    }
}
