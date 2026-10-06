package com.tasty.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.function.Predicate;
import java.util.regex.Pattern;

/** Builds URL slugs: "Crème Brûlée & Co." becomes "creme-brulee-co". */
public final class SlugUtils {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9]+");
    private static final Pattern EDGE_HYPHENS = Pattern.compile("(^-+)|(-+$)");

    private SlugUtils() {
    }

    public static String slugify(String input) {
        if (input == null) {
            return "";
        }
        String normalized = Normalizer.normalize(input.trim(), Normalizer.Form.NFD);
        String ascii = DIACRITICS.matcher(normalized).replaceAll("")
                .replace("&", " and ")
                .toLowerCase(Locale.ROOT);
        String slug = NON_ALPHANUMERIC.matcher(ascii).replaceAll("-");
        return EDGE_HYPHENS.matcher(slug).replaceAll("");
    }

    /**
     * Returns {@code base}, or {@code base-2}, {@code base-3}, ... until {@code taken} reports it is free.
     *
     * @param maxLength the column length; the base is shortened so the suffix always fits
     */
    public static String unique(String base, int maxLength, Predicate<String> taken) {
        String root = base.isBlank() ? "item" : base;
        if (root.length() > maxLength) {
            root = trim(root, maxLength);
        }
        String candidate = root;
        int suffix = 2;
        while (taken.test(candidate)) {
            String tail = "-" + suffix++;
            candidate = trim(root, maxLength - tail.length()) + tail;
        }
        return candidate;
    }

    private static String trim(String value, int length) {
        String cut = value.length() <= length ? value : value.substring(0, length);
        return EDGE_HYPHENS.matcher(cut).replaceAll("");
    }
}
