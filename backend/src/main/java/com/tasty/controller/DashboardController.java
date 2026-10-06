package com.tasty.controller;

import com.tasty.config.OpenApiConfig;
import com.tasty.dto.common.ApiResponse;
import com.tasty.dto.dashboard.DashboardDto;
import com.tasty.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Admin overview",
            description = "Totals, dishes per category, messages received over the last 14 days, recent dishes and messages.")
    @GetMapping
    public ApiResponse<DashboardDto> overview() {
        return ApiResponse.ok(dashboardService.overview());
    }
}
