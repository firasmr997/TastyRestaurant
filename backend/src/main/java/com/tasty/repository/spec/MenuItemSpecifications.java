package com.tasty.repository.spec;

import com.tasty.entity.Category;
import com.tasty.entity.MenuItem;
import com.tasty.util.Text;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/** Composable filters for the menu search. */
public final class MenuItemSpecifications {

    private static final char ESCAPE = '\\';

    private MenuItemSpecifications() {
    }

    public static Specification<MenuItem> filter(MenuFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<MenuItem, Category> category = root.join("category", JoinType.INNER);

            if (!filter.includeInactiveCategories()) {
                predicates.add(cb.isTrue(category.get("active")));
            }
            if (filter.categoryId() != null) {
                predicates.add(cb.equal(category.get("id"), filter.categoryId()));
            }
            if (filter.categorySlug() != null) {
                predicates.add(cb.equal(category.get("slug"), filter.categorySlug()));
            }
            if (filter.available() != null) {
                predicates.add(cb.equal(root.get("available"), filter.available()));
            }
            if (filter.featured() != null) {
                predicates.add(cb.equal(root.get("featured"), filter.featured()));
            }
            if (filter.vegetarian() != null) {
                predicates.add(cb.equal(root.get("vegetarian"), filter.vegetarian()));
            }
            if (filter.spicy() != null) {
                predicates.add(cb.equal(root.get("spicy"), filter.spicy()));
            }
            String pattern = Text.likePattern(filter.query());
            if (pattern != null) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, ESCAPE),
                        cb.like(cb.lower(root.get("nameFr")), pattern, ESCAPE),
                        cb.like(cb.lower(root.get("description")), pattern, ESCAPE),
                        cb.like(cb.lower(root.get("descriptionFr")), pattern, ESCAPE),
                        cb.like(cb.lower(root.get("ingredients")), pattern, ESCAPE),
                        cb.like(cb.lower(root.get("ingredientsFr")), pattern, ESCAPE)));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    /**
     * @param query                     free text matched against names, descriptions and ingredients (EN and FR)
     * @param includeInactiveCategories staff-only: also return dishes whose category is hidden
     */
    public record MenuFilter(
            String query,
            Long categoryId,
            String categorySlug,
            Boolean available,
            Boolean featured,
            Boolean vegetarian,
            Boolean spicy,
            boolean includeInactiveCategories) {
    }
}
