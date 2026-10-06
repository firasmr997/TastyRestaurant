package com.tasty.util;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;

/** Converts between the comma-separated ingredient columns and API lists. */
public final class CsvList {

    private CsvList() {
    }

    public static List<String> split(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    /** Joins trimmed, non-empty, de-duplicated values; returns null for an empty list. */
    public static String join(List<String> values) {
        if (values == null) {
            return null;
        }
        LinkedHashSet<String> cleaned = new LinkedHashSet<>();
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                cleaned.add(value.trim());
            }
        }
        return cleaned.isEmpty() ? null : String.join(", ", cleaned);
    }
}
