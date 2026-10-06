package com.tasty.dto.gallery;

public record UploadResponse(String url, String storageKey, String contentType, long size) {
}
