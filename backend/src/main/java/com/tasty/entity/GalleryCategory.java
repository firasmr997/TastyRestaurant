package com.tasty.entity;

import com.tasty.storage.StorageFolder;

import java.util.Arrays;
import java.util.List;

/** Photo categories, split into the food gallery and the restaurant gallery. */
public enum GalleryCategory {
    FOOD(GalleryGroup.FOOD),
    SANDWICH(GalleryGroup.FOOD),
    BURGER(GalleryGroup.FOOD),
    PLATE(GalleryGroup.FOOD),
    DESSERT(GalleryGroup.FOOD),
    DRINK(GalleryGroup.FOOD),
    EXTERIOR(GalleryGroup.RESTAURANT),
    INTERIOR(GalleryGroup.RESTAURANT),
    DINING(GalleryGroup.RESTAURANT),
    KITCHEN(GalleryGroup.RESTAURANT),
    BAR(GalleryGroup.RESTAURANT),
    TEAM(GalleryGroup.RESTAURANT),
    ATMOSPHERE(GalleryGroup.RESTAURANT);

    private final GalleryGroup group;

    GalleryCategory(GalleryGroup group) {
        this.group = group;
    }

    public GalleryGroup group() {
        return group;
    }

    /** Where uploads for this category are stored. */
    public StorageFolder storageFolder() {
        if (this == TEAM) {
            return StorageFolder.TEAM;
        }
        return group == GalleryGroup.FOOD ? StorageFolder.GALLERY : StorageFolder.RESTAURANT;
    }

    public static List<GalleryCategory> inGroup(GalleryGroup group) {
        return Arrays.stream(values()).filter(c -> c.group == group).toList();
    }
}
