package com.tasty.storage;

import com.tasty.config.StorageProperties;
import com.tasty.exception.StorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/** Stores uploads on the local file system under {@code tasty.storage.upload-directory}. */
@Slf4j
@Service
@ConditionalOnProperty(prefix = "tasty.storage", name = "type", havingValue = "local", matchIfMissing = true)
public class LocalImageStorageService implements ImageStorageService {

    private final Path root;
    private final String publicBaseUrl;

    public LocalImageStorageService(StorageProperties properties) {
        this.root = Path.of(properties.uploadDirectory()).toAbsolutePath().normalize();
        this.publicBaseUrl = trimTrailingSlash(properties.publicBaseUrl());
        try {
            for (StorageFolder folder : StorageFolder.values()) {
                Files.createDirectories(root.resolve(folder.path()));
            }
        } catch (IOException e) {
            throw new StorageException("Could not initialise upload directory " + root, e);
        }
        log.info("Local image storage at {}", root);
    }

    public Path getRoot() {
        return root;
    }

    @Override
    public StoredImage upload(InputStream content, long size, String extension, String contentType, StorageFolder folder) {
        String key = folder.path() + "/" + UUID.randomUUID() + "." + extension;
        Path target = resolve(key);
        try {
            Files.copy(content, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new StorageException("Could not store image " + key, e);
        }
        return new StoredImage(key, getUrl(key), contentType, size);
    }

    @Override
    public void delete(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }
        try {
            Files.deleteIfExists(resolve(storageKey));
        } catch (IOException e) {
            // Deleting is best effort: a leftover file is harmless, a failed request is not.
            log.warn("Could not delete stored image {}: {}", storageKey, e.getMessage());
        }
    }

    @Override
    public String getUrl(String storageKey) {
        return publicBaseUrl + "/" + storageKey;
    }

    /** Resolves a key inside the root, rejecting anything that would escape it. */
    private Path resolve(String storageKey) {
        Path resolved = root.resolve(storageKey).normalize();
        if (!resolved.startsWith(root)) {
            throw new StorageException("Invalid storage key");
        }
        return resolved;
    }

    private static String trimTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
