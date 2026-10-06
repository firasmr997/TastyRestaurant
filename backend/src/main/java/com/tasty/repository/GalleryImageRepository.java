package com.tasty.repository;

import com.tasty.entity.GalleryCategory;
import com.tasty.entity.GalleryImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Collection;
import java.util.Optional;

public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long>, JpaSpecificationExecutor<GalleryImage> {

    @Override
    @EntityGraph(attributePaths = "menuItem")
    Page<GalleryImage> findAll(Specification<GalleryImage> spec, Pageable pageable);

    @EntityGraph(attributePaths = "menuItem")
    Optional<GalleryImage> findWithMenuItemById(Long id);

    long countByCategoryIn(Collection<GalleryCategory> categories);

    boolean existsByStorageKey(String storageKey);
}
