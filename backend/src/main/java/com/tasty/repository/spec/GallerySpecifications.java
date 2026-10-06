package com.tasty.repository.spec;

import com.tasty.entity.GalleryCategory;
import com.tasty.entity.GalleryGroup;
import com.tasty.entity.GalleryImage;
import com.tasty.util.Text;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class GallerySpecifications {

    private GallerySpecifications() {
    }

    public static Specification<GalleryImage> filter(GalleryFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (filter.group() != null) {
                predicates.add(root.get("category").in(GalleryCategory.inGroup(filter.group())));
            }
            if (filter.categories() != null && !filter.categories().isEmpty()) {
                predicates.add(root.get("category").in(filter.categories()));
            }
            if (filter.featured() != null) {
                predicates.add(cb.equal(root.get("featured"), filter.featured()));
            }
            if (filter.menuItemId() != null) {
                predicates.add(cb.equal(root.get("menuItem").get("id"), filter.menuItemId()));
            }
            String pattern = Text.likePattern(filter.query());
            if (pattern != null) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern, '\\'),
                        cb.like(cb.lower(root.get("titleFr")), pattern, '\\'),
                        cb.like(cb.lower(root.get("description")), pattern, '\\'),
                        cb.like(cb.lower(root.get("descriptionFr")), pattern, '\\')));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    public record GalleryFilter(GalleryGroup group, List<GalleryCategory> categories, Boolean featured,
                                Long menuItemId, String query) {
    }
}
