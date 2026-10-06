package com.tasty.storage;

import java.util.Arrays;
import java.util.Optional;

/** Logical folders for uploaded images: /uploads/menu, /uploads/gallery, /uploads/restaurant, /uploads/team. */
public enum StorageFolder {
    MENU("menu"),
    GALLERY("gallery"),
    RESTAURANT("restaurant"),
    TEAM("team");

    private final String path;

    StorageFolder(String path) {
        this.path = path;
    }

    public String path() {
        return path;
    }

    public static Optional<StorageFolder> fromValue(String value) {
        return Arrays.stream(values())
                .filter(f -> f.name().equalsIgnoreCase(value) || f.path.equalsIgnoreCase(value))
                .findFirst();
    }
}
