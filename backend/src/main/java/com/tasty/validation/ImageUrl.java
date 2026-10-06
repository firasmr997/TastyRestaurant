package com.tasty.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * An image reference the frontend can render: an absolute http(s) URL or a path served by the
 * storage layer (for example {@code /uploads/menu/abc.webp}). Null values are considered valid.
 */
@Documented
@Constraint(validatedBy = ImageUrlValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT, ElementType.TYPE_USE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ImageUrl {

    String message() default "must be an http(s) URL or an uploaded image path";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
