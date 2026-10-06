package com.tasty.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "menu_items")
public class MenuItem extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "name_fr", length = 120)
    private String nameFr;

    @Column(nullable = false, length = 140)
    private String slug;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(name = "description_fr", length = 1000)
    private String descriptionFr;

    /** Comma-separated list, exposed as an array by the API. */
    @Column(length = 1000)
    private String ingredients;

    @Column(name = "ingredients_fr", length = 1000)
    private String ingredientsFr;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "main_image_url", length = 1000)
    private String mainImageUrl;

    /** Storage key when the main image was uploaded through the API; null for external URLs. */
    @Column(name = "main_image_key", length = 500)
    private String mainImageKey;

    @Column(name = "main_image_alt", length = 255)
    private String mainImageAlt;

    @Column(nullable = false)
    private boolean available = true;

    @Column(nullable = false)
    private boolean featured;

    @Column(nullable = false)
    private boolean vegetarian;

    @Column(nullable = false)
    private boolean spicy;

    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<MenuItemImage> images = new ArrayList<>();

    public void addImage(MenuItemImage image) {
        image.setMenuItem(this);
        images.add(image);
    }
}
