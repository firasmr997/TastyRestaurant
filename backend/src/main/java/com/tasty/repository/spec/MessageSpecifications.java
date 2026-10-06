package com.tasty.repository.spec;

import com.tasty.entity.ContactMessage;
import com.tasty.entity.MessageStatus;
import com.tasty.util.Text;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class MessageSpecifications {

    private MessageSpecifications() {
    }

    /** Without a status the inbox shows NEW and READ messages; archived ones need an explicit filter. */
    public static Specification<ContactMessage> filter(MessageStatus status, String query) {
        return (root, criteria, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            } else {
                predicates.add(cb.notEqual(root.get("status"), MessageStatus.ARCHIVED));
            }
            String pattern = Text.likePattern(query);
            if (pattern != null) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, '\\'),
                        cb.like(cb.lower(root.get("email")), pattern, '\\'),
                        cb.like(cb.lower(root.get("phone")), pattern, '\\'),
                        cb.like(cb.lower(root.get("message")), pattern, '\\')));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
