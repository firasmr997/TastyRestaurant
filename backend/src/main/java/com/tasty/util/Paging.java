package com.tasty.util;

import com.tasty.exception.BadRequestException;

/** Validates page parameters so no client can request unbounded result sets. */
public final class Paging {

    public static final int MAX_PAGE_SIZE = 100;

    private Paging() {
    }

    public static void check(int page, int size) {
        if (page < 0) {
            throw new BadRequestException("'page' must be 0 or greater");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("'size' must be between 1 and " + MAX_PAGE_SIZE);
        }
    }
}
