package com.tasty.controller;

import com.tasty.config.OpenApiConfig;
import com.tasty.dto.common.ApiResponse;
import com.tasty.dto.settings.SettingsDto;
import com.tasty.dto.settings.SettingsRequest;
import com.tasty.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Settings")
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @Operation(summary = "Restaurant profile, opening hours, social links and promotion (public)")
    @GetMapping
    public ApiResponse<SettingsDto> get() {
        return ApiResponse.ok(settingsService.get());
    }

    @Operation(summary = "Update restaurant settings (ADMIN only)", security = @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH))
    @PutMapping
    public ApiResponse<SettingsDto> update(@Valid @RequestBody SettingsRequest request) {
        return ApiResponse.ok(settingsService.update(request), "Settings saved");
    }
}
