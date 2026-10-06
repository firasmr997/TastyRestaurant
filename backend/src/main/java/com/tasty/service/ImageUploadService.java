package com.tasty.service;

import com.tasty.dto.gallery.UploadResponse;
import com.tasty.exception.BadRequestException;
import com.tasty.exception.ConflictException;
import com.tasty.exception.StorageException;
import com.tasty.storage.ImageFileValidator;
import com.tasty.storage.ImageStorageService;
import com.tasty.storage.StorageFolder;
import com.tasty.storage.StoredImage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageUploadService {

    /** Keys produced by the storage layer: {@code <folder>/<uuid>.<ext>}. */
    private static final Pattern STORAGE_KEY = Pattern.compile(
            "^(menu|gallery|restaurant|team)/[0-9a-f-]{36}\\.(jpg|png|webp|avif)$");

    private final ImageFileValidator validator;
    private final ImageStorageService storage;
    private final ImageCleanupService imageCleanup;

    public UploadResponse upload(MultipartFile file, String folderValue) {
        StorageFolder folder = StorageFolder.fromValue(folderValue)
                .orElseThrow(() -> new BadRequestException("Unknown folder. Use menu, gallery, restaurant or team"));
        ImageFileValidator.ValidatedImage image = validator.validate(file);
        try (InputStream content = file.getInputStream()) {
            StoredImage stored = storage.upload(content, image.size(), image.extension(), image.contentType(), folder);
            log.info("Image uploaded: {} ({} bytes)", stored.storageKey(), stored.size());
            return new UploadResponse(stored.url(), stored.storageKey(), stored.contentType(), stored.size());
        } catch (IOException e) {
            throw new StorageException("Could not read upload", e);
        }
    }

    /** Deletes an upload that was never attached to a dish or gallery photo (e.g. an abandoned form). */
    @Transactional(readOnly = true)
    public void deleteUnused(String storageKey) {
        if (storageKey == null || !STORAGE_KEY.matcher(storageKey).matches()) {
            throw new BadRequestException("Invalid storage key");
        }
        if (imageCleanup.isReferenced(storageKey)) {
            throw new ConflictException("This image is still used by a dish or gallery photo");
        }
        storage.delete(storageKey);
        log.info("Unused image deleted: {}", storageKey);
    }
}
