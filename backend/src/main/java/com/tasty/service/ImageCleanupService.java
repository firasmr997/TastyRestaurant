package com.tasty.service;

import com.tasty.repository.GalleryImageRepository;
import com.tasty.repository.MenuItemImageRepository;
import com.tasty.repository.MenuItemRepository;
import com.tasty.storage.ImageStorageService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Deletes stored files that no record references any more, but only after the surrounding transaction
 * commits: a rolled-back update must never lose its images.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImageCleanupService {

    private final ImageStorageService storage;
    private final MenuItemRepository menuItemRepository;
    private final MenuItemImageRepository menuItemImageRepository;
    private final GalleryImageRepository galleryImageRepository;
    private final EntityManager entityManager;

    /** Must be called inside a transaction, after the entity changes have been applied. */
    public void deleteUnreferencedAfterCommit(Collection<String> storageKeys) {
        if (storageKeys == null || storageKeys.isEmpty()) {
            return;
        }
        entityManager.flush();
        Set<String> orphaned = new LinkedHashSet<>();
        for (String key : storageKeys) {
            if (key != null && !key.isBlank() && !isReferenced(key)) {
                orphaned.add(key);
            }
        }
        if (orphaned.isEmpty()) {
            return;
        }
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    orphaned.forEach(ImageCleanupService.this::deleteQuietly);
                }
            });
        } else {
            orphaned.forEach(this::deleteQuietly);
        }
    }

    public boolean isReferenced(String storageKey) {
        return menuItemRepository.existsByMainImageKey(storageKey)
                || menuItemImageRepository.existsByStorageKey(storageKey)
                || galleryImageRepository.existsByStorageKey(storageKey);
    }

    private void deleteQuietly(String key) {
        try {
            storage.delete(key);
            log.debug("Deleted unreferenced image {}", key);
        } catch (RuntimeException e) {
            log.warn("Could not delete image {}: {}", key, e.getMessage());
        }
    }
}
