package com.tasty.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "gallery_images")
public class GalleryImage extends AuditableEntity {

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "title_fr", length = 150)
    private String titleFr;

    @Column(length = 600)
    private String description;

    @Column(name = "description_fr", length = 600)
    private String descriptionFr;

    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    @Column(name = "storage_key", length = 500)
    private String storageKey;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private GalleryCategory category;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean featured;

    /** Optional link to the dish shown in the photo ("assign to dish"). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id")
    private MenuItem menuItem;
}
