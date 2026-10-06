package com.tasty.controller;

import com.tasty.dto.common.ApiResponse;
import com.tasty.dto.message.ContactRequest;
import com.tasty.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Contact")
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @Operation(summary = "Send a message to the restaurant",
            description = "Public. Stored for the team in admin -> Messages. Limited to a few submissions per address.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> submit(@Valid @RequestBody ContactRequest request, HttpServletRequest http) {
        contactService.submit(request, http.getRemoteAddr());
        return ApiResponse.message("Thanks! Your message is on its way to the team.");
    }
}
