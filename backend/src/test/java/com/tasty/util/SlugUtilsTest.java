package com.tasty.util;

import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class SlugUtilsTest {

    @Test
    void slugifiesAccentsSymbolsAndSpaces() {
        assertThat(SlugUtils.slugify("Crème Brûlée & Co.")).isEqualTo("creme-brulee-and-co");
        assertThat(SlugUtils.slugify("  The   Tasty  Smash!! ")).isEqualTo("the-tasty-smash");
        assertThat(SlugUtils.slugify("Chef's Specials")).isEqualTo("chef-s-specials");
        assertThat(SlugUtils.slugify(null)).isEmpty();
    }

    @Test
    void appendsASuffixUntilTheSlugIsFree() {
        Set<String> taken = Set.of("burgers", "burgers-2");
        assertThat(SlugUtils.unique("burgers", 100, taken::contains)).isEqualTo("burgers-3");
        assertThat(SlugUtils.unique("salads", 100, taken::contains)).isEqualTo("salads");
    }

    @Test
    void keepsTheSuffixWithinTheColumnLength() {
        String base = "a".repeat(20);
        String slug = SlugUtils.unique(base, 10, candidate -> candidate.length() == 10 && !candidate.contains("-"));
        assertThat(slug).hasSizeLessThanOrEqualTo(10).endsWith("-2");
    }
}
