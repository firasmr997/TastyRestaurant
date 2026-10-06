package com.tasty.util;

/** Small string helpers for request normalisation. */
public final class Text {

    private Text() {
    }

    /** Trims the value and turns blank strings into null, so optional columns stay NULL rather than "". */
    public static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /** Escapes LIKE wildcards and lowercases a free-text search term. Returns null for blank input. */
    public static String likePattern(String query) {
        String cleaned = clean(query);
        if (cleaned == null) {
            return null;
        }
        String escaped = cleaned.toLowerCase()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + escaped + "%";
    }
}
