package com.tasty.controller;

import com.tasty.config.OpenApiConfig;
import com.tasty.dto.common.ApiResponse;
import com.tasty.dto.gallery.UploadResponse;
import com.tasty.service.ImageUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Images")
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ImageController {

    private final ImageUploadService uploadService;

    @Operation(summary = "Upload an image",
            description = "Accepts JPG, PNG, WebP or AVIF up to the configured size (8 MB by default). The MIME type, "
                    + "extension and file signature must all match. Returns the url and storageKey to attach to a "
                    + "dish or gallery photo.")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UploadResponse> upload(
            @Parameter(description = "Image file") @RequestPart("file") MultipartFile file,
            @Parameter(description = "menu, gallery, restaurant or team") @RequestParam(defaultValue = "gallery") String folder) {
        return ApiResponse.ok(uploadService.upload(file, folder), "Image uploaded");
    }

    @Operation(summary = "Delete an unused upload",
            description = "Removes an uploaded file that is not attached to any dish or photo (409 otherwise).")
    @DeleteMapping
    public ApiResponse<Void> delete(@Parameter(description = "storageKey returned by the upload") @RequestParam String key) {
        uploadService.deleteUnused(key);
        return ApiResponse.message("Image deleted");
    }
}
