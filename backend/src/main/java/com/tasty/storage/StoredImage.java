package com.tasty.storage;

/**
 * Result of storing an image.
 *
 * @param storageKey provider-neutral key used to delete or replace the file later (e.g. {@code menu/2f1c.webp})
 * @param url        URL the frontend can render
 */
public record StoredImage(String storageKey, String url, String contentType, long size) {
}
