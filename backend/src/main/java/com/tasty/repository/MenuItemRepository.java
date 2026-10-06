package com.tasty.repository;

import com.tasty.entity.Category;
import com.tasty.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long>, JpaSpecificationExecutor<MenuItem> {

    @Override
    @EntityGraph(attributePaths = "category")
    Page<MenuItem> findAll(Specification<MenuItem> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "images"})
    Optional<MenuItem> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"category", "images"})
    Optional<MenuItem> findWithDetailsBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    long countByCategoryId(Long categoryId);

    long countByAvailableTrue();

    long countByFeaturedTrue();

    boolean existsByMainImageKey(String storageKey);

    @EntityGraph(attributePaths = "category")
    List<MenuItem> findTop5ByOrderByCreatedAtDesc();

    @Query("select m.category.id as categoryId, count(m) as total from MenuItem m group by m.category.id")
    List<CategoryCount> countPerCategory();

    @Query("select m.category.id as categoryId, count(m) as total from MenuItem m "
            + "where m.category.id in :ids group by m.category.id")
    List<CategoryCount> countPerCategory(@Param("ids") Collection<Long> categoryIds);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update MenuItem m set m.category = :target, m.updatedAt = :now, m.updatedBy = :actor "
            + "where m.category = :source")
    int reassignCategory(@Param("source") Category source,
                         @Param("target") Category target,
                         @Param("now") Instant now,
                         @Param("actor") String actor);

    interface CategoryCount {
        Long getCategoryId();

        long getTotal();
    }
}
