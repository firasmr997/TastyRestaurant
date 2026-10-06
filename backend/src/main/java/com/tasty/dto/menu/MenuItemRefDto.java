package com.tasty.dto.menu;

/** Minimal link to a dish (used by gallery photos assigned to a dish). */
public record MenuItemRefDto(Long id, String slug, String name, String nameFr) {
}
